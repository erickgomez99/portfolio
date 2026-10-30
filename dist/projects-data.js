'use strict';

const projects = {
  inventory: {
    title: 'Sales & inventory, in one view.',
    status: 'Experience summary · supporting artifacts to add',
    intro: 'Operational reporting informed by day-to-day e-commerce responsibilities: sales, stock, and the discrepancies between them.',
    challenge: 'Sales and inventory need to be reconciled across recurring reports, live shows, drops, and campaigns so the team can plan the next step with a consistent view.',
    approach: ['Prepare daily, weekly, and monthly sales and inventory reports in Excel.', 'Reconcile sales and stock records, investigate discrepancies, and surface exceptions for review.', 'Support inventory planning and merchandising decisions with operational context.'],
    deliverable: 'A documented case study is planned around a reporting workbook and an anonymized Power BI view. The preview on this site is an illustrative design, not a screenshot of a completed client dashboard.',
    evidence: ['Add an authorized, anonymized source file and finished report screenshot.', 'Document the reconciliation rules, reporting cadence, and checks performed.', 'Add measured processing time, record counts, and errors detected only when verified.'],
    limit: 'No quantified time savings, revenue lift, or inventory improvement is claimed.',
    tools: ['Excel', 'Power BI', 'Inventory reconciliation', 'Sales reporting'],
    type: 'Data & reporting'
  },
  sku: {
    title: 'Product images. The right SKU.',
    status: 'Notebook inspected · sample validation pending',
    intro: 'A saved Google Colab notebook tackles a practical product-data task: take images from an Excel workbook and export a ZIP with SKU-based filenames.',
    challenge: 'Images embedded in product workbooks are difficult to reuse outside Excel. Extracting and naming them individually creates a repetitive handoff.',
    approach: ['Read SKUs from column A and associate them with images in column B.', 'Include code paths for modern in-cell images and traditional floating images.', 'Sanitize filenames, suffix duplicate SKU names, report missing-SKU warnings, and package images into a ZIP.'],
    deliverable: 'An existing Python / Colab notebook using openpyxl, Pillow, and Excel ZIP/XML relationships. These steps are present in the inspected source; the saved notebook has no recorded execution results.',
    evidence: ['Add a small anonymized workbook covering both image types, duplicate SKUs, and missing SKUs.', 'Attach an inspected output ZIP and a source-to-filename validation table.', 'Record actual image count, processing time, and any unsupported Excel variants after testing.'],
    limit: 'Code inspection confirms the intended workflow, not production reliability or support for every Excel format. The portfolio does not run the notebook.',
    tools: ['Python', 'Google Colab', 'openpyxl', 'Pillow', 'Excel'],
    type: 'Process automation'
  },
  reporting: {
    title: 'A repeatable reporting rhythm.',
    status: 'Experience summary · process evidence to add',
    intro: 'A reporting approach based on experience moving Excel reporting into Power BI, including dataflows and recurring refreshes.',
    challenge: 'Recurring reports depend on consistent inputs and transformations. Repeated file preparation makes the refresh process harder to maintain and review.',
    approach: ['Structure source data with consistent types and validation rules.', 'Use Power Query transformations and Power BI dataflows to prepare reporting inputs.', 'Set up recurring refreshes and management reporting, with checks around the output.'],
    deliverable: 'An experience-based outline of an Excel-to-Power BI reporting process. An authorized process diagram, sanitized report, and documented refresh setup are still needed for a complete case study.',
    evidence: ['Add a before-and-after process map and a sanitized data model.', 'Document refresh configuration, validation checks, and how failures are handled.', 'Measure the manual baseline and the final workflow before publishing any time-savings claim.'],
    limit: 'The illustrated process is conceptual. No unattended success rate or verified efficiency improvement is stated.',
    tools: ['Power BI', 'Power Query', 'Dataflows', 'Excel', 'Data validation'],
    type: 'Data & reporting'
  },
  compression: {
    title: 'Lighter workbooks. Easier handoffs.',
    status: 'Notebook inspected · recorded output present',
    intro: 'A saved Colab workflow processes embedded product images inside an Excel workbook and writes a separate output file for sharing.',
    challenge: 'Image-heavy product workbooks can be cumbersome to hand off. A repeatable preparation step can resize and optimize the embedded media.',
    approach: ['Read supported PNG and JPEG images from the workbook’s xl/media directory.', 'Limit larger images to a maximum dimension of 1,280 pixels while preserving aspect ratio.', 'Optimize PNGs with transparency retained, apply JPEG compression, and repackage the workbook as a separate file.'],
    deliverable: 'An existing Python notebook using Pillow and zipfile. Its saved output includes a completion message and a generated XLSX download, but does not include a before-and-after size comparison or a workbook integrity check.',
    evidence: ['Add a sanitized sample workbook and compare input and output file sizes.', 'Check the output in Excel, including images, formulas, and relationships.', 'Review image quality, unsupported images, and skipped files before claiming a validated result.'],
    limit: 'No compression percentage or guaranteed file-size reduction is claimed. JPEG compression may reduce visual quality; the source currently skips image-processing exceptions silently.',
    tools: ['Python', 'Pillow', 'zipfile', 'Google Colab', 'Excel'],
    type: 'Process automation'
  }
};

