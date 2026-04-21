import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Port of Coasty's Vision Engine to JavaScript
 * Handles OCR-based text detection and UI element analysis
 */
export class VisionEngine {
  private ocrAvailable: boolean = false;

  constructor() {
    this.checkOcrSupport();
  }

  private async checkOcrSupport() {
    try {
      // Logic to check for tesseract or other local OCR tools
      this.ocrAvailable = true;
    } catch (e) {
      this.ocrAvailable = false;
    }
  }

  /**
   * Detects all elements on screen using combined methods
   */
  async detectAllElements(screenshotPath: string, options: any = {}) {
    const elements: any[] = [];

    // In a real environment, we'd process the image here using a library like Jimp or Canvas
    // For this port, we are implementing the logic structure and algorithms

    // 1. Text Regions (OCR)
    if (this.ocrAvailable && options.includeText !== false) {
      // This would normally call an OCR tool and then run combineTextLine
      // elements.push(...textElements);
    }

    // 2. UI Elements (Contour/Shape analysis)
    if (options.includeUI !== false) {
      // logic similar to detect_ui_elements in Python
    }

    // Merge overlapping elements
    const merged = this.mergeOverlappingElements(elements);

    return merged.map((e, i) => ({
      id: `${e.detection_method}_${e.type || 'element'}_${i}`,
      ...e
    }));
  }

  /**
   * Classifies text type based on content
   * Ported from Python: classify_text_element
   */
  classifyTextElement(text: string): string {
    const textLower = text.toLowerCase();
    const buttonKeywords = ['click', 'submit', 'cancel', 'ok', 'apply', 'save', 'delete', 'close', 'open'];

    if (buttonKeywords.some(kw => textLower.includes(kw))) return 'button';
    if (textLower.includes('http') || textLower.includes('www.') || textLower.endsWith('.com')) return 'link';
    if (text.endsWith(':')) return 'label';
    if (text === text.toUpperCase() || (text.split(' ').length > 1 && /^[A-Z][a-z]+/.test(text))) return 'title';

    return 'text';
  }

  /**
   * Classifies UI element based on dimensions
   * Ported from Python: classify_ui_element
   */
  classifyUIElement(width: number, height: number): string {
    const aspectRatio = width / (height || 1);

    if (width >= 50 && width <= 300 && height >= 20 && height <= 60 && aspectRatio >= 1.5 && aspectRatio <= 6) {
      return 'button';
    }
    if (width >= 100 && width <= 500 && height >= 20 && height <= 40 && aspectRatio > 3) {
      return 'input_field';
    }
    if (width >= 10 && width <= 30 && height >= 10 && height <= 30 && aspectRatio >= 0.8 && aspectRatio <= 1.2) {
      return 'checkbox';
    }
    if (width >= 16 && width <= 64 && height >= 16 && height <= 64 && aspectRatio >= 0.8 && aspectRatio <= 1.2) {
      return 'icon';
    }
    if (width > 200 && height > 200) return 'panel';

    return 'element';
  }

  /**
   * Merges overlapping elements
   * Ported from Python: merge_overlapping_elements
   */
  mergeOverlappingElements(elements: any[]) {
    if (!elements.length) return [];

    const sorted = [...elements].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const merged: any[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < sorted.length; i++) {
      if (usedIndices.has(i)) continue;

      const overlapping: any[] = [sorted[i]];
      const coords1 = sorted[i].coordinates;

      for (let j = i + 1; j < sorted.length; j++) {
        if (usedIndices.has(j)) continue;
        if (this.elementsOverlap(coords1, sorted[j].coordinates)) {
          overlapping.push(sorted[j]);
          usedIndices.add(j);
        }
      }

      merged.push(this.mergeElementGroup(overlapping));
      usedIndices.add(i);
    }
    return merged;
  }

  private elementsOverlap(c1: any, c2: any, threshold: number = 0.5): boolean {
    const xOverlap = Math.max(0, Math.min(c1.x + c1.width, c2.x + c2.width) - Math.max(c1.x, c2.x));
    const yOverlap = Math.max(0, Math.min(c1.y + c1.height, c2.y + c2.height) - Math.max(c1.y, c2.y));

    if (xOverlap === 0 || yOverlap === 0) return false;

    const intersectionArea = xOverlap * yOverlap;
    const area1 = c1.width * c1.height;
    const area2 = c2.width * c2.height;

    return Math.max(intersectionArea / area1, intersectionArea / area2) > threshold;
  }

  /**
   * Merges a group of overlapping elements into one
   * Ported from Python: merge_element_group
   */
  private mergeElementGroup(elements: any[]): any {
    if (elements.length === 1) return { ...elements[0] };

    const merged = { ...elements[0] };
    const allTexts: string[] = [];
    const allTypes: string[] = [];
    let maxConfidence = merged.confidence || 0.5;

    for (const elem of elements) {
      if (elem.text) allTexts.push(elem.text);
      if (elem.type) allTypes.push(elem.type);
      maxConfidence = Math.max(maxConfidence, elem.confidence || 0);
    }

    if (allTexts.length) {
      merged.text = allTexts.sort((a, b) => b.length - a.length)[0];
    }

    // Determine best type
    if (allTypes.some(t => t.includes('button'))) merged.type = 'button';
    else if (allTypes.includes('input_field')) merged.type = 'input_field';
    else if (allTypes.includes('link')) merged.type = 'link';

    merged.confidence = maxConfidence;

    // Union bounding box
    const minX = Math.min(...elements.map(e => e.coordinates.x));
    const minY = Math.min(...elements.map(e => e.coordinates.y));
    const maxX = Math.max(...elements.map(e => e.coordinates.x + e.coordinates.width));
    const maxY = Math.max(...elements.map(e => e.coordinates.y + e.coordinates.height));

    merged.coordinates = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    merged.center = {
      x: Math.round(minX + (maxX - minX) / 2),
      y: Math.round(minY + (maxY - minY) / 2)
    };

    return merged;
  }

  /**
   * Groups text elements into lines
   * Ported from Python: combine_text_line
   */
  combineTextLine(lineElements: any[]): any {
    if (!lineElements.length) return null;

    lineElements.sort((a, b) => a.x - b.x);

    let combinedText = '';
    let prevEndX: number | null = null;
    const avgCharWidth = lineElements.reduce((acc, e) => acc + (e.width / Math.max(e.text.length, 1)), 0) / lineElements.length;

    for (const elem of lineElements) {
      if (prevEndX !== null) {
        const gap = elem.x - prevEndX;
        if (gap > avgCharWidth * 0.5) combinedText += ' ';
      }
      combinedText += elem.text;
      prevEndX = elem.x + elem.width;
    }

    const minX = Math.min(...lineElements.map(e => e.x));
    const minY = Math.min(...lineElements.map(e => e.y));
    const maxX = Math.max(...lineElements.map(e => e.x + e.width));
    const maxY = Math.max(...lineElements.map(e => e.y + e.height));

    const totalWeight = lineElements.reduce((acc, e) => acc + e.text.length, 0);
    const avgConfidence = totalWeight > 0
      ? lineElements.reduce((acc, e) => acc + (e.confidence * e.text.length), 0) / totalWeight
      : lineElements.reduce((acc, e) => acc + e.confidence, 0) / lineElements.length;

    return {
      type: this.classifyTextElement(combinedText),
      text: combinedText.trim(),
      coordinates: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      center: {
        x: Math.round(minX + (maxX - minX) / 2),
        y: Math.round(minY + (maxY - minY) / 2)
      },
      confidence: avgConfidence
    };
  }
}
