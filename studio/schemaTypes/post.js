import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ 
      name: 'isFeatured', 
      title: 'Featured Post', 
      type: 'boolean', 
      initialValue: false 
    }),
    defineField({ 
      name: 'displayStatus', 
      title: 'Display Status', 
      type: 'string', 
      options: { list: ['standard', 'trending', 'highlight'], layout: 'radio' } 
    }),
    defineField({ 
      name: 'titleEmphasis', 
      title: 'Title Accent / Emphasis', 
      type: 'string' 
    }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'excerpt', title: 'SEO Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'lead', title: 'Lead Paragraph', type: 'text', rows: 4 }),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: {type: 'author'} }),
    defineField({ name: 'mainImage', title: 'Main image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'categories', title: 'Categories', type: 'array', of: [{type: 'reference', to: {type: 'category'}}] }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
    defineField({ name: 'readingTime', title: 'Reading Time', type: 'string' }),
    defineField({ name: 'issue', title: 'Volume / Issue Name', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'blockContent' }),
  ],
})