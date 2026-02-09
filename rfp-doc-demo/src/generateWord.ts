import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import type { RfpInstance } from './types';

export async function generateWord(instance: RfpInstance) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `RFP Instance: ${instance.instanceId}`,
            heading: 'Heading1',
          }),
          new Paragraph({
            text: `Source Template: ${instance.sourceTemplateId} (v${instance.sourceTemplateVersion})`,
          }),
          new Paragraph({
            text: `Created: ${new Date(instance.createdAt).toLocaleString()}`,
          }),
          new Paragraph({
            text: `Last Updated: ${new Date(instance.updatedAt).toLocaleString()}`,
          }),
          ...instance.sections.map(section => {
            if (section.type === 'table' && Array.isArray(section.instanceContent)) {
              return [
                new Paragraph({
                  text: section.title,
                  heading: 'Heading2',
                }),
                new Table({
                  rows: section.instanceContent.map(row =>
                    new TableRow({
                      children: row.map(cell =>
                        new TableCell({
                          children: [new Paragraph(cell)],
                        })
                      ),
                    })
                  ),
                }),
              ];
            } else {
              return [
                new Paragraph({
                  text: section.title,
                  heading: 'Heading2',
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: typeof section.instanceContent === 'string' ? section.instanceContent : '',
                    }),
                  ],
                }),
              ];
            }
          }).flat(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `RFP_${instance.instanceId}.docx`);
}
