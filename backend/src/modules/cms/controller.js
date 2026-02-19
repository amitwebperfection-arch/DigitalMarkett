import Page from './model.js';
import * as cmsService from './service.js';

export const createPage = async (req, res, next) => {
  try {
    const page = await cmsService.createPage(req.body, req.user.id);
    res.status(201).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

export const getPages = async (req, res, next) => {
  try {
    const { status } = req.query;
    const pages = await cmsService.getPages(status);
    res.json({ success: true, pages });
  } catch (error) {
    next(error);
  }
};

export const getPageBySlug = async (req, res, next) => {
  try {
    const page = await cmsService.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req, res, next) => {
  try {
    const page = await cmsService.updatePage(req.params.id, req.body);
    res.json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req, res, next) => {
  try {
    await cmsService.deletePage(req.params.id);
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    next(error);
  }
};

export const getPageById = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ success: true, page });
  } catch (error) {
    next(error);
  }
};