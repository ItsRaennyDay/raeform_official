// ═══════════════════════════════════════════════════════════════
//  RAEFORM — Sanity CMS Schema
//  File: schemas/post.js
//
//  SETUP INSTRUCTIONS:
//  1. Run in your terminal: npm create sanity@latest
//     - Choose "Clean project with no predefined schemas"
//     - Project name: raeform-journal
//     - Dataset: production
//  2. Inside the generated /schemas folder, create this file as post.js
//  3. Open sanity.config.js and import + register this schema:
//       import post from './schemas/post'
//       import author from './schemas/author'
//       import category from './schemas/category'
//       export default defineConfig({ schema: { types: [post, author, category] } })
//  4. Run: npx sanity dev  → opens your Sanity Studio at localhost:3333
//  5. Publish posts from the Studio dashboard
// ═══════════════════════════════════════════════════════════════


// ─────────────────────────────────────────
//  AUTHOR SCHEMA
//  Trishia's profile — reused across posts
// ─────────────────────────────────────────
export const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'initials',
      title: 'Initials (shown in avatar)',
      type: 'string',
      description: 'e.g. TR for Trishia Raymundo',
      validation: Rule => Rule.required().max(3),
    },
    {
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g. Founder, RAEFORM · Business Support Services',
    },
    {
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 4,
      description: 'Shown at the bottom of every article.',
    },
    {
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      description: 'Optional. If not set, initials avatar is shown.',
      options: { hotspot: true },
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    },
    {
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
  },
}


// ─────────────────────────────────────────
//  CATEGORY SCHEMA
//  Branding, Operations, Web & Tech, etc.
// ─────────────────────────────────────────
export const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Category Name',
      type: 'string',
      description: 'e.g. Branding, Operations, Web & Tech',
      validation: Rule => Rule.required(),
    },
    {
      // Used in URL filtering and CSS class mapping
      // Must be: branding | operations | web | biz | mindset | nonprofit
      name: 'slug',
      title: 'Slug (for filtering)',
      type: 'string',
      description: 'Lowercase, no spaces. Must match the filter buttons in blog.html.',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Branding',     value: 'branding'   },
          { title: 'Operations',   value: 'operations' },
          { title: 'Web & Tech',   value: 'web'        },
          { title: 'Business Tips',value: 'biz'        },
          { title: 'Mindset',      value: 'mindset'    },
          { title: 'Nonprofit',    value: 'nonprofit'  },
        ],
      },
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2,
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug' },
  },
}


// ─────────────────────────────────────────
//  CUSTOM PORTABLE TEXT BLOCKS
//  These are the special content blocks
//  that map to your CSS classes in blog-item.html
// ─────────────────────────────────────────

// art-pullquote block
const pullquoteBlock = {
  type: 'object',
  name: 'pullquote',
  title: 'Pull Quote',
  fields: [
    {
      name: 'quote',
      title: 'Quote text',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required(),
    },
    {
      name: 'attribution',
      title: 'Attribution (optional)',
      type: 'string',
      description: 'e.g. — Trishia Raymundo, Founder of RAEFORM',
    },
  ],
  preview: {
    select: { title: 'quote' },
    prepare({ title }) {
      return { title: `❝ ${title?.slice(0, 60)}…` }
    },
  },
}

// art-callout block
const calloutBlock = {
  type: 'object',
  name: 'callout',
  title: 'Callout Box',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. Key Point, Remember, Note',
      initialValue: 'Key point',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: { title: 'label', subtitle: 'content' },
    prepare({ title, subtitle }) {
      return { title: `📌 ${title}`, subtitle: subtitle?.slice(0, 60) }
    },
  },
}

// art-stats block (up to 3 stat items)
const statsBlock = {
  type: 'object',
  name: 'statsBlock',
  title: 'Stat Block (up to 3)',
  fields: [
    {
      name: 'stats',
      title: 'Stats',
      type: 'array',
      validation: Rule => Rule.required().min(1).max(3),
      of: [
        {
          type: 'object',
          fields: [
            { name: 'number', title: 'Number / Value', type: 'string', description: 'e.g. 7, 3×, 68%' },
            { name: 'suffix', title: 'Suffix (optional)', type: 'string', description: 'e.g. sec, ×, %' },
            { name: 'label',  title: 'Label',  type: 'string', description: 'e.g. First impression window' },
          ],
          preview: {
            select: { title: 'number', subtitle: 'label' },
          },
        },
      ],
    },
  ],
  preview: {
    select: { stats: 'stats' },
    prepare({ stats }) {
      return { title: `📊 Stat Block (${stats?.length || 0} items)` }
    },
  },
}

// art-img-wrap block (inline image with caption)
const imageBlock = {
  type: 'image',
  name: 'imageBlock',
  title: 'Inline Image',
  options: { hotspot: true },
  fields: [
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Displayed below the image in small muted text.',
    },
    {
      name: 'alt',
      title: 'Alt text (accessibility)',
      type: 'string',
      validation: Rule => Rule.required().warning('Alt text improves SEO and accessibility.'),
    },
  ],
  preview: {
    select: { title: 'caption', media: 'asset' },
    prepare({ title, media }) {
      return { title: title || 'Image', media }
    },
  },
}


// ─────────────────────────────────────────
//  POST SCHEMA  ← the main one
// ─────────────────────────────────────────
export const post = {
  name: 'post',
  title: 'Blog Post',
  type: 'document',

  // Groups organize the Studio sidebar into tabs
  groups: [
    { name: 'content',  title: 'Content',  default: true },
    { name: 'meta',     title: 'Metadata'  },
    { name: 'seo',      title: 'SEO'       },
  ],

  fields: [

    // ── CONTENT GROUP ──────────────────────
    {
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'content',
      description: 'The main headline. Keep under 80 characters.',
      validation: Rule => Rule.required().max(80),
    },
    {
      name: 'titleEmphasis',
      title: 'Italic emphasis portion (optional)',
      type: 'string',
      group: 'content',
      description: 'If set, this portion of the title renders in italic blue. Must match exactly a part of the title.',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'Auto-generated from title. Used in the URL: /blog/[slug]',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt / Hero Subheading',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown below the title in the article hero and on blog listing cards. 1–2 sentences.',
      validation: Rule => Rule.required().max(220),
    },
    {
      name: 'lead',
      title: 'Lead Paragraph',
      type: 'text',
      rows: 5,
      group: 'content',
      description: 'The large italic paragraph that opens the article body. Sets the tone.',
    },
    {
      name: 'body',
      title: 'Article Body',
      type: 'array',
      group: 'content',
      description: 'The full article content. Use H2 for section headings, H3 for sub-headings.',
      of: [
        // Standard rich text blocks
        {
          type: 'block',
          styles: [
            { title: 'Normal',      value: 'normal'     },
            { title: 'Heading 2',   value: 'h2'         },
            { title: 'Heading 3',   value: 'h3'         },
          ],
          lists: [
            { title: 'Bullet',   value: 'bullet'   },
            { title: 'Numbered', value: 'number'   },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Italic', value: 'em'     },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href',   type: 'url',     title: 'URL'                    },
                  { name: 'blank',  type: 'boolean', title: 'Open in new tab?'       },
                ],
              },
            ],
          },
        },
        // Custom blocks
        pullquoteBlock,
        calloutBlock,
        statsBlock,
        imageBlock,
      ],
    },

    // ── META GROUP ─────────────────────────
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
      validation: Rule => Rule.required(),
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'meta',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: Rule => Rule.required().min(1).max(3),
      description: 'Pick 1–3. First category is used for the primary tag display.',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      description: 'Used as the full-screen article hero background. Use a high-res landscape image (min 1800×900px).',
      validation: Rule => Rule.required(),
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: Rule => Rule.required(),
        },
      ],
    },
    {
      name: 'publishedAt',
      title: 'Publish Date',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
    },
    {
      name: 'readingTime',
      title: 'Reading Time',
      type: 'string',
      group: 'meta',
      description: 'e.g. "5 min read". Estimate 200 words per minute.',
      placeholder: '5 min read',
    },
    {
      name: 'featured',
      title: 'Featured post?',
      type: 'boolean',
      group: 'meta',
      description: 'If on, this post appears in the hero featured slot on the blog catalog page.',
      initialValue: false,
    },
    {
      name: 'issue',
      title: 'Journal Issue Label (optional)',
      type: 'string',
      group: 'meta',
      description: 'e.g. "Journal · Issue 01". Shown in the article byline.',
    },

    // ── SEO GROUP ──────────────────────────
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Overrides the page <title> tag. If blank, article title is used. Keep under 60 chars.',
      validation: Rule => Rule.max(60),
    },
    {
      name: 'seoDescription',
      title: 'SEO Meta Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Shown in Google results. If blank, excerpt is used. Keep under 160 chars.',
      validation: Rule => Rule.max(160),
    },
    {
      name: 'ogImage',
      title: 'Social Share Image (OG Image)',
      type: 'image',
      group: 'seo',
      description: 'Shown when shared on LinkedIn, X, etc. Ideal size: 1200×630px. Falls back to cover image.',
    },
  ],

  // Studio card preview
  preview: {
    select: {
      title:    'title',
      author:   'author.name',
      cat:      'categories.0.title',
      media:    'coverImage',
      featured: 'featured',
    },
    prepare({ title, author, cat, media, featured }) {
      return {
        title:    (featured ? '⭐ ' : '') + title,
        subtitle: `${cat || 'Uncategorised'} · ${author || 'No author'}`,
        media,
      }
    },
  },

  // Sort newest first in Studio sidebar
  orderings: [
    {
      title: 'Newest first',
      name:  'publishedAtDesc',
      by:    [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Oldest first',
      name:  'publishedAtAsc',
      by:    [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
}


// ─────────────────────────────────────────
//  DEFAULT EXPORT
//  Register all three schemas in one array
//  Import this in sanity.config.js like:
//
//  import { post, author, category } from './schemas/post'
//  schema: { types: [post, author, category] }
// ─────────────────────────────────────────
export default [post, author, category]
