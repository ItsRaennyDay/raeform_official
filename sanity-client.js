
const SANITY_PROJECT_ID = 'y5g5f0dm';
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = '2024-01-01';

const BASE_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}`;

async function sanityFetch(groqQuery, params = {}) {
  const encodedQuery  = encodeURIComponent(groqQuery.trim());
  const encodedParams = Object.entries(params)
    .map(([k, v]) => `&$${k}=${encodeURIComponent(JSON.stringify(v))}`)
    .join('');

  const url = `${BASE_URL}?query=${encodedQuery}${encodedParams}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    return json.result;
  } catch (err) {
    console.error('[RAEFORM Sanity] Fetch error:', err);
    return null;
  }
}


function imageUrl(imageRef, { w, h, q = 75, fit = 'clip', fm = 'webp' } = {}) {
  // 1. Safety check
  if (!imageRef?.asset?._ref) return null;

  // 2. Build the URL
  const [, id, dimensions, format] = imageRef.asset._ref.split('-');
  const baseUrl = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
  
  // 3. Add parameters (width, height, quality, etc.)
  const params = new URLSearchParams({
    w: w || '',
    h: h || '',
    q: q,
    fit: fit,
    fm: fm
  });

  return `${baseUrl}?${params.toString()}`;
}


function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'long',
    year:  'numeric',
  });
}


// ─────────────────────────────────────────
//  CATEGORY → CSS CLASS MAP
//  Maps category slugs to art-tag CSS classes
//  defined in blog.html and blog-item.html
// ─────────────────────────────────────────
const TAG_CLASS_MAP = {
  branding:   'art-tag-branding',
  operations: 'art-tag-operations',
  web:        'art-tag-web',
  biz:        'art-tag-biz',
  mindset:    'art-tag-mindset',
  nonprofit:  'art-tag-nonprofit',
};

function categoryClass(slug) {
  return TAG_CLASS_MAP[slug] || 'art-tag-biz';
}

// Same map but for blog.html listing cards
const CARD_TAG_CLASS_MAP = {
  branding:   'tag-branding',
  operations: 'tag-operations',
  web:        'tag-web',
  biz:        'tag-biz',
  mindset:    'tag-mindset',
  nonprofit:  'tag-nonprofit',
};

function cardTagClass(slug) {
  return CARD_TAG_CLASS_MAP[slug] || 'tag-biz';
}


// ═══════════════════════════════════════════════════════════════
//  GROQ QUERIES
// ═══════════════════════════════════════════════════════════════

const CARD_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  readingTime,
  "isFeatured": coalesce(isFeatured, featured, false),
  "category": categories[0]->slug.current,
  "coverUrl": mainImage.asset->url,
  "coverRef": mainImage,
  "categories": categories[]->{ title, "slug": slug.current },
  "author": author->{ name, initials, role }
}`;

// Full projection for a single article page
const FULL_PROJECTION = `{
  _id,
  title,
  titleEmphasis,
  "slug": slug.current,
  excerpt,
  lead,
  publishedAt,
  readingTime,
  "isFeatured": coalesce(isFeatured, featured, false),
  "category": categories[0]->slug.current,
  issue,
  "coverUrl": mainImage.asset->url,
  "coverRef": mainImage,
  "ogImageRef": ogImage,
  "categories": categories[]->{ title, "slug": slug.current },
  "author": author->{ name, initials, role, bio, linkedin, instagram, "photoUrl": photo.asset->url },
  body,
  seoTitle,
  seoDescription,
  "prevPost": *[_type=="post" && publishedAt < ^.publishedAt && !(_id in path("drafts.**"))] | order(publishedAt desc)[0]{ title, "slug": slug.current },
  "nextPost": *[_type=="post" && publishedAt > ^.publishedAt && !(_id in path("drafts.**"))] | order(publishedAt asc)[0]{ title, "slug": slug.current },
  "related": *[
    _type == "post" &&
    count(categories[@._ref in ^.^.categories[]._ref]) > 0 &&
    _id != ^._id &&
    !(_id in path("drafts.**"))
  ] | order(publishedAt desc)[0..2] ${CARD_PROJECTION}
}`;


// ─────────────────────────────────────────
//  Q1 — ALL POSTS (blog.html catalog)
//  Returns all published posts, newest first.
//  Optional category filter.
// ─────────────────────────────────────────
async function getAllPosts(categorySlug = null) {
  const filter = categorySlug && categorySlug !== 'all'
    ? `_type == "post" && !(_id in path("drafts.**")) && $categorySlug in categories[]->slug`
    : `_type == "post" && !(_id in path("drafts.**"))`;

  const query = `*[${filter}] | order(featured desc, publishedAt desc) ${CARD_PROJECTION}`;

  return sanityFetch(query, categorySlug && categorySlug !== 'all'
    ? { categorySlug }
    : {}
  );
}


// ─────────────────────────────────────────
//  Q2 — FEATURED POST (blog.html hero card)
//  Returns the single post marked featured:true.
//  Falls back to most recent if none marked.
// ─────────────────────────────────────────
async function getFeaturedPost() {
  const query = `
    coalesce(
      *[_type=="post" && featured==true && !(_id in path("drafts.**"))] | order(publishedAt desc)[0] ${CARD_PROJECTION},
      *[_type=="post" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0] ${CARD_PROJECTION}
    )
  `;
  return sanityFetch(query);
}


// ─────────────────────────────────────────
//  Q3 — STACKED SIDE POSTS (blog.html right column)
//  Returns the 3 most recent non-featured posts.
// ─────────────────────────────────────────
async function getSidePosts(excludeId = null) {
  const excludeClause = excludeId ? `&& _id != $excludeId` : '';
  const query = `
    *[_type=="post" && !(_id in path("drafts.**")) ${excludeClause}]
    | order(publishedAt desc)[0..2] ${CARD_PROJECTION}
  `;
  return sanityFetch(query, excludeId ? { excludeId } : {});
}


// ─────────────────────────────────────────
//  Q4 — SECONDARY GRID POSTS (blog.html grid)
//  Returns posts after the hero/side block.
//  Excludes IDs already shown above.
// ─────────────────────────────────────────
async function getSecondaryPosts(excludeIds = [], limit = 6) {
  const excludeClause = excludeIds.length
    ? `&& !(_id in $excludeIds)`
    : '';
  const query = `
    *[_type=="post" && !(_id in path("drafts.**")) ${excludeClause}]
    | order(publishedAt desc)[0..${limit - 1}] ${CARD_PROJECTION}
  `;
  return sanityFetch(query, excludeIds.length ? { excludeIds } : {});
}


// ─────────────────────────────────────────
//  Q5 — SINGLE POST (blog-item.html)
//  Fetches full article data by slug.
//  Includes body, author, related, prev/next.
// ─────────────────────────────────────────
async function getPostBySlug(slug) {
  const query = `*[_type=="post" && slug.current==$slug && !(_id in path("drafts.**"))][0] ${FULL_PROJECTION}`;
  return sanityFetch(query, { slug });
}


// ─────────────────────────────────────────
//  Q6 — ALL SLUGS (for static generation / sitemap)
//  Returns just slugs — useful if you ever
//  move to a static site generator later.
// ─────────────────────────────────────────
async function getAllSlugs() {
  const query = `*[_type=="post" && !(_id in path("drafts.**"))]{ "slug": slug.current }`;
  return sanityFetch(query);
}


// ═══════════════════════════════════════════════════════════════
//  PORTABLE TEXT → HTML RENDERER
//  Converts Sanity's body[] Portable Text blocks into
//  the HTML markup that matches your blog-item.html CSS.
//
//  Handles:
//    - Standard blocks (p, h2, h3, ul, ol, strong, em, links)
//    - Custom: pullquote, callout, statsBlock, imageBlock
// ═══════════════════════════════════════════════════════════════
function portableTextToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';

  let html = '';
  let listType   = null; // 'bullet' | 'number' | null
  let listBuffer = '';   // accumulates <li> items

  function flushList() {
    if (!listBuffer) return;
    const tag = listType === 'number' ? 'ol' : 'ul';
    html += `<${tag}>${listBuffer}</${tag}>`;
    listBuffer = '';
    listType   = null;
  }

  blocks.forEach(block => {

    // ── STANDARD BLOCK (paragraph, headings) ──
    if (block._type === 'block') {
      const style    = block.style || 'normal';
      const isListItem = !!block.listItem;
      const itemType   = block.listItem; // 'bullet' | 'number'

      // Render inline spans with marks
      const innerHtml = (block.children || []).map(span => {
        let text = escapeHtml(span.text || '');
        if (!span.marks?.length) return text;

        span.marks.forEach(mark => {
          if (mark === 'strong') text = `<strong>${text}</strong>`;
          else if (mark === 'em') text = `<em>${text}</em>`;
          else {
            // It's an annotation key — find the mark def
            const def = (block.markDefs || []).find(d => d._key === mark);
            if (def?._type === 'link') {
              const target = def.blank ? ' target="_blank" rel="noopener"' : '';
              text = `<a href="${escapeHtml(def.href)}"${target}>${text}</a>`;
            }
          }
        });
        return text;
      }).join('');

      // List items — buffer them
      if (isListItem) {
        if (listType && listType !== itemType) flushList();
        listType   = itemType;
        listBuffer += `<li>${innerHtml}</li>`;
        return;
      }

      // Non-list block — flush any open list first
      flushList();

      if (style === 'h2') {
        // Auto-generate id for TOC
        const id = innerHtml
          .replace(/<[^>]+>/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        html += `<h2 id="${id}">${innerHtml}</h2>`;
      } else if (style === 'h3') {
        html += `<h3>${innerHtml}</h3>`;
      } else {
        html += `<p>${innerHtml}</p>`;
      }
      return;
    }

    // Non-block type — flush any open list first
    flushList();

    // ── PULLQUOTE ──
    if (block._type === 'pullquote') {
      const cite = block.attribution
        ? `<cite>${escapeHtml(block.attribution)}</cite>`
        : '';
      html += `
        <div class="art-pullquote">
          <p>${escapeHtml(block.quote)}</p>
          ${cite}
        </div>`;
      return;
    }

    // ── CALLOUT ──
    if (block._type === 'callout') {
      html += `
        <div class="art-callout">
          <div class="art-callout-label">${escapeHtml(block.label || 'Note')}</div>
          <p>${escapeHtml(block.content)}</p>
        </div>`;
      return;
    }

    // ── STATS BLOCK ──
    if (block._type === 'statsBlock' && block.stats?.length) {
      const statsHtml = block.stats.map(s => `
        <div class="art-stat">
          <div class="art-stat-num">${escapeHtml(s.number || '')}${s.suffix ? `<span>${escapeHtml(s.suffix)}</span>` : ''}</div>
          <div class="art-stat-label">${escapeHtml(s.label || '')}</div>
        </div>`).join('');
      html += `<div class="art-stats">${statsHtml}</div>`;
      return;
    }

    // ── INLINE IMAGE ──
    if (block._type === 'imageBlock' && block.asset?._ref) {
      const src     = imageUrl(block, { w: 1200, q: 80 });
      const alt     = escapeHtml(block.alt || '');
      const caption = block.caption
        ? `<div class="art-img-caption">${escapeHtml(block.caption)}</div>`
        : '';
      html += `
        <div class="art-img-wrap">
          <img src="${src}" alt="${alt}" loading="lazy">
          ${caption}
        </div>`;
      return;
    }

  });

  // Flush any remaining list
  flushList();

  return html;
}

// Simple HTML escape — prevents XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}


// ═══════════════════════════════════════════════════════════════
//  RENDER HELPERS
//  Small utilities used by both blog.html and blog-item.html
//  to build HTML strings from fetched data.
// ═══════════════════════════════════════════════════════════════

// Build a category tag span/pill for listing cards
function renderCardTag(category) {
  if (!category) return '';
  const cls = cardTagClass(category.slug);
  return `<span class="blog-card-tag ${cls}">${escapeHtml(category.title)}</span>`;
}

// Build a category tag span for article hero / footer
function renderArtTag(category) {
  if (!category) return '';
  const cls = categoryClass(category.slug);
  return `<span class="art-tag ${cls}">${escapeHtml(category.title)}</span>`;
}

// Render the hero featured card (big left card in blog.html)
function renderFeaturedCard(post) {
  if (!post) return '';
  const cover   = imageUrl(post.coverRef, { w: 1400, q: 80 }) || post.coverUrl || '';
  const tags    = (post.categories || []).map(renderCardTag).join('');
  const date    = formatDate(post.publishedAt);
  const reading = post.readingTime || '';

  return `
    <a class="blog-hero-card" href="blog-item.html?slug=${encodeURIComponent(post.slug)}">
      <div class="blog-hero-card-bg" style="background-image:url('${cover}')"></div>
      <div class="blog-hero-card-over">
        <div class="blog-card-featured-badge">Featured Read</div>
        <h2 class="blog-hero-card-title">${escapeHtml(post.title)}</h2>
        <div class="blog-hero-card-meta">
          ${tags}
          <span class="blog-card-date">${date}</span>
          ${reading ? `<span class="blog-card-read">${escapeHtml(reading)}</span>` : ''}
          <span class="blog-card-arr">↗</span>
        </div>
      </div>
    </a>`;
}

// Render a stacked side card (right column on blog.html)
function renderSideCard(post, index) {
  if (!post) return '';
  const cover    = imageUrl(post.coverRef, { w: 800, q: 75 }) || post.coverUrl || '';
  const bgStyle  = cover ? `style="background-image:url('${cover}')"` : '';
  const num      = String(index + 2).padStart(2, '0');
  const firstCat = post.categories?.[0];
  const tag      = firstCat ? renderCardTag(firstCat) : '';
  const reading  = post.readingTime || '';

  return `
    <a class="blog-side-card" href="blog-item.html?slug=${encodeURIComponent(post.slug)}">
      <div class="blog-side-card-bg" ${bgStyle}></div>
      <div class="blog-side-card-content">
        <div class="blog-side-card-num">${num}</div>
        <div class="blog-side-card-title">${escapeHtml(post.title)}</div>
        <div class="blog-side-card-foot">
          ${tag}
          ${reading ? `<span class="blog-card-read">${escapeHtml(reading)}</span>` : ''}
        </div>
      </div>
    </a>`;
}

// Render a standard grid card (secondary section on blog.html)
function renderStandardCard(post, index) {
  if (!post) return '';
  const num      = String(index + 5).padStart(2, '0');
  const excerpt  = post.excerpt || '';
  const firstCat = post.categories?.[0];
  const tag      = firstCat ? renderCardTag(firstCat) : '';
  const date     = formatDate(post.publishedAt);

  return `
    <a class="blog-standard-card" href="blog-item.html?slug=${encodeURIComponent(post.slug)}">
      <div>
        <div class="blog-standard-card-num">${num}</div>
        <h3 class="blog-standard-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-standard-card-excerpt">${escapeHtml(excerpt)}</p>
      </div>
      <div class="blog-standard-card-foot">
        ${tag}
        <span class="blog-card-date">${date}</span>
        <span class="blog-standard-card-arr">↗</span>
      </div>
    </a>`;
}

// Render a related post card (bottom of blog-item.html)
function renderRelatedCard(post, index) {
  if (!post) return '';
  const num      = String(index + 1).padStart(2, '0');
  const firstCat = post.categories?.[0];
  const reading  = post.readingTime || '';

  return `
    <a class="art-related-card" href="blog-item.html?slug=${encodeURIComponent(post.slug)}">
      <div>
        <div class="art-related-num">${num}</div>
        <div class="art-related-title">${escapeHtml(post.title)}</div>
      </div>
      <div class="art-related-foot">
        ${firstCat ? `<span class="art-tag ${categoryClass(firstCat.slug)}" style="font-size:.5rem;padding:4px 10px">${escapeHtml(firstCat.title)}</span>` : ''}
        ${reading ? `<span style="font-size:.6rem;color:var(--muted2)">${escapeHtml(reading)}</span>` : ''}
        <span class="art-related-arr">↗</span>
      </div>
    </a>`;
}


// ─────────────────────────────────────────
//  LOADING STATE HELPERS
//  Show skeleton placeholders while fetching
// ─────────────────────────────────────────
function showSkeleton(elementId, type = 'card') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const skeletons = {
    card: `<div style="background:var(--navy3);height:100%;min-height:280px;animation:skeletonPulse 1.5s ease-in-out infinite"></div>`,
    hero: `<div style="background:var(--navy3);height:400px;animation:skeletonPulse 1.5s ease-in-out infinite"></div>`,
  };

  el.innerHTML = skeletons[type] || skeletons.card;
}

// Inject the skeleton keyframe once
if (!document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `
    @keyframes skeletonPulse {
      0%,100% { opacity:.4; }
      50%      { opacity:.7; }
    }
  `;
  document.head.appendChild(style);
}


// ─────────────────────────────────────────
//  ERROR STATE HELPER
// ─────────────────────────────────────────
function showError(elementId, message = 'Could not load content.') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = `
    <div style="padding:4rem;text-align:center;color:var(--muted);font-size:.85rem">
      <div style="font-size:1.5rem;margin-bottom:1rem;opacity:.4">◎</div>
      ${escapeHtml(message)}
    </div>`;
}


// ═══════════════════════════════════════════════════════════════
//  GLOBAL RAEFORM OBJECT
//  Everything exposed to blog.html and blog-item.html
// ═══════════════════════════════════════════════════════════════
window.RAEFORM = {
  // Queries
  getAllPosts,
  getFeaturedPost,
  getSidePosts,
  getSecondaryPosts,
  getPostBySlug,
  getAllSlugs,

  // Renderers
  renderFeaturedCard,
  renderSideCard,
  renderStandardCard,
  renderRelatedCard,
  renderCardTag,
  renderArtTag,
  portableTextToHtml,

  // Utilities
  imageUrl,
  formatDate,
  categoryClass,
  cardTagClass,
  escapeHtml,

  // UI helpers
  showSkeleton,
  showError,
};

console.log('[RAEFORM] Sanity client ready. Project:', SANITY_PROJECT_ID);
