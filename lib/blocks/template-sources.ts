/**
 * Template source code mapping for React export functionality
 *
 * This file aggregates template source code from individual source files,
 * with import paths pre-processed for export compatibility.
 *
 * Import path conversions:
 * - @/components/ui/* → ./ui/*
 * - Template components are stored with their full implementation
 */

import { hero1Source } from './template-sources/hero1.source';
import { navbar1Source } from './template-sources/navbar1.source';
import { footer2Source } from './template-sources/footer2.source';
import { feature43Source } from './template-sources/feature43.source';
import { blog7Source } from './template-sources/blog7.source';
import { about3Source } from './template-sources/about3.source';
import { codeexample1Source } from './template-sources/codeexample1.source';
import { casestudies2Source } from './template-sources/casestudies2.source';
import { gallery6Source } from './template-sources/gallery6.source';
import { pricing2Source } from './template-sources/pricing2.source';
import { download2Source } from './template-sources/download2.source';
import { faq1Source } from './template-sources/faq1.source';

export interface TemplateSourceMap {
  [typeId: string]: string;
}

/**
 * Pre-processed template source code mapped by typeId
 * Each template's imports have been converted for export compatibility
 */
export const templateSources: TemplateSourceMap = {
  hero1: hero1Source,
  navbar1: navbar1Source,
  footer2: footer2Source,
  feature43: feature43Source,
  blog7: blog7Source,
  about3: about3Source,
  codeexample1: codeexample1Source,
  casestudies2: casestudies2Source,
  gallery6: gallery6Source,
  pricing2: pricing2Source,
  download2: download2Source,
  faq1: faq1Source,
};

/**
 * Get template source code by typeId
 * @param typeId - The template type identifier (e.g., 'hero1', 'navbar1')
 * @returns The template source code with pre-processed imports, or undefined if not found
 */
export function getTemplateSource(typeId: string): string | undefined {
  return templateSources[typeId];
}

/**
 * Get all available template typeIds
 * @returns Array of all registered template typeIds
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(templateSources);
}

/**
 * Check if a template source exists
 * @param typeId - The template type identifier to check
 * @returns True if the template source exists, false otherwise
 */
export function hasTemplateSource(typeId: string): boolean {
  return typeId in templateSources;
}