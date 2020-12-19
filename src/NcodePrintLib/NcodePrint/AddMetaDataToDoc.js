import {
  PDFContentStream,
  PDFDictionary,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFName,
  PDFNumber,
  PDFRawStream,
  drawText,
  drawLinesOfText,
} from 'pdf-lib';

const charCodes = (str) => str.split('').map((c) => c.charCodeAt(0));

const typedArrayFor = (str) => new Uint8Array(charCodes(str));

const whitespacePadding = new Array(20).fill(' '.repeat(100)).join('\n');

export const addMetadataToDoc = (pdfDoc, options) => {
  const metadataXML = `
    <?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

          <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:format>application/pdf</dc:format>
            <dc:creator>
              <rdf:Seq>
                <rdf:li>${options.author}</rdf:li>
              </rdf:Seq>
            </dc:creator>
            <dc:title>
               <rdf:Alt>
                  <rdf:li xml:lang="x-default">${options.title}</rdf:li>
               </rdf:Alt>
            </dc:title>
            <dc:subject>
              <rdf:Bag>
                ${options.keywords
      .map((keyword) => `<rdf:li>${keyword}</rdf:li>`)
      .join('\n')}
              </rdf:Bag>
            </dc:subject>
          </rdf:Description>

          <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
            <xmp:CreatorTool>${options.creatorTool}</xmp:CreatorTool>
            <xmp:CreateDate>${options.documentCreationDate.toISOString()}</xmp:CreateDate>
            <xmp:ModifyDate>${options.documentModificationDate.toISOString()}</xmp:ModifyDate>
            <xmp:MetadataDate>${options.metadataModificationDate.toISOString()}</xmp:MetadataDate>
          </rdf:Description>

          <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <pdf:Subject>${options.subject}</pdf:Subject>
            <pdf:Producer>${options.producer}</pdf:Producer>
          </rdf:Description>

        </rdf:RDF>
      </x:xmpmeta>
      ${whitespacePadding}
    <?xpacket end="w"?>
  `.trim();

  const metadataStreamDict = PDFDictionary.from(
    {
      Type: PDFName.from('Metadata'),
      Subtype: PDFName.from('XML'),
      Length: PDFNumber.fromNumber(metadataXML.length),
    },
    pdfDoc.index,
  );

  const metadataStream = PDFRawStream.from(
    metadataStreamDict,
    typedArrayFor(metadataXML),
  );

  const metadataStreamRef = pdfDoc.register(metadataStream);

  pdfDoc.catalog.set('Metadata', metadataStreamRef);
};

// const pdfDoc = PDFDocumentFactory.create();
// const [TimesRomanFont] = pdfDoc.embedStandardFont('Times-Roman');
// const [HelveticaFont] = pdfDoc.embedStandardFont('Helvetica');

// const contentStream = pdfDoc.createContentStream(
//   drawText('The Life of an Egg', {
//     font: 'TimesRoman',
//     x: 60,
//     y: 500,
//     size: 50,
//   }),
//   drawText('An Epic Tale of Woe', {
//     font: 'TimesRoman',
//     x: 125,
//     y: 460,
//     size: 25,
//   }),
//   drawLinesOfText(
//     [
//       'Humpty Dumpty sat on a wall',
//       'Humpty Dumpty had a great fall;',
//       `All the king's horses and all the king's men`,
//       `Couldn't put Humpty together again.`,
//     ],
//     {
//       font: 'Helvetica',
//       x: 75,
//       y: 275,
//       size: 20,
//       lineHeight: 25,
//     },
//   ),
//   drawText('- Humpty Dumpty', {
//     font: 'Helvetica',
//     x: 250,
//     y: 150,
//     size: 20,
//   }),
// );

// const page = pdfDoc
//   .createPage([500, 600])
//   .addFontDictionary('Helvetica', HelveticaFont)
//   .addFontDictionary('TimesRoman', TimesRomanFont)
//   .addContentStreams(pdfDoc.register(contentStream));

// pdfDoc.addPage(page);

// addMetadataToDoc(pdfDoc, {
//   author: 'Humpty Dumpty',
//   title: 'The Life of an Egg',
//   subject: 'An Epic Tale of Woe',
//   keywords: ['eggs', 'wall', 'fall', 'king', 'horses', 'men'],
//   producer: `Your App's Name Goes Here`,
//   creatorTool:
//     'pdf-lib pdf-lib_version_goes_here (https://github.com/Hopding/pdf-lib)',
//   documentCreationDate: new Date(),
//   documentModificationDate: new Date(),
//   metadataModificationDate: new Date(),
// });

// const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

// const filePath = `${__dirname}/new.pdf`;
// fs.writeFileSync(filePath, pdfBytes);
// console.log(`PDF file written to: ${filePath}`);
