import Page from './model.js';
import { slugify } from '../../utils/slugify.js';

export const createPage = async (pageData, authorId) => {
  const slug = pageData.slug || slugify(pageData.title); // ← frontend slug lo

  const page = await Page.create({
    ...pageData,
    slug,
    author: authorId,
    publishedAt: pageData.status === 'published' ? new Date() : null
  });

  return page;
};

export const getPages = async (status = null) => {
  const query = status ? { status } : {};
  return await Page.find(query)
    .populate('author', 'name')
    .sort({ createdAt: -1 });
};

export const getPageBySlug = async (slug) => {
  return await Page.findOne({ slug, status: 'published' })
    .populate('author', 'name avatar');
};

export const updatePage = async (pageId, updates) => {
  if (updates.status === 'published') {
    updates.publishedAt = updates.publishedAt || new Date();
  }

  if (updates.status === 'draft') {
    updates.publishedAt = null; // ← draft pe publishedAt clear karo
  }

  return await Page.findByIdAndUpdate(
    pageId,
    { $set: updates },
    { new: true, runValidators: true }
  );
};

export const deletePage = async (pageId) => {
  return await Page.findByIdAndDelete(pageId);
};