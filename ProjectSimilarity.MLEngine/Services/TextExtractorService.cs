using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;

namespace ProjectSimilarity.MLEngine.Services;

public class TextExtractorService
{
    public string ExtractText(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();

        return extension switch
        {
            ".pdf" => ExtractPdfText(filePath),
            ".docx" => ExtractDocxText(filePath),
            ".cs" or ".js" or ".py" or ".txt" => File.ReadAllText(filePath),
            _ => File.ReadAllText(filePath)
        };
    }

    private static string ExtractPdfText(string filePath)
    {
        using var document = PdfDocument.Open(filePath);
        var pages = document.GetPages().Select(page => page.Text);
        return string.Join(Environment.NewLine, pages);
    }

    private static string ExtractDocxText(string filePath)
    {
        using var document = WordprocessingDocument.Open(filePath, false);
        var paragraphs = document.MainDocumentPart?.Document.Body?.Descendants<Paragraph>().Select(paragraph => paragraph.InnerText) ?? Enumerable.Empty<string>();
        return string.Join(Environment.NewLine, paragraphs);
    }
}