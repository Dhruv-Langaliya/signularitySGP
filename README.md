# ProjectSimilarity Engine 🔍

An academic anti-plagiarism and project similarity analysis platform built with **.NET 10 Web API** and **TF-IDF & Cosine Similarity NLP algorithms**.

## 🚀 Features
- **Document Text Extraction**: Extracts text from `.pdf` (`PdfPig`), `.docx` (`OpenXml`), `.cs`, `.js`, `.py`, and `.txt` files.
- **NLP Similarity Engine**: Preprocesses text (lowercasing, punctuation stripping, stop-word removal), computes TF-IDF term vectors, and calculates normalized Cosine Similarity scores.
- **Risk Level Classification**: Low Risk (<40%), Medium Risk (40%-70%), High Risk (>=70%).
- **Role-Based Access Control**:
  - 🎓 **Student**: Upload project document reports.
  - 👨‍🏫 **Faculty**: View project repository, run similarity checks against corpus, view reports.
  - 🛡️ **Admin**: Dashboard metrics, role management, project inspection.
- **Built-in Web Portal**: Single-page application UI (`HTML5`/`CSS3`/`Vanilla JS`).

## 🛠 Tech Stack
- **Backend Framework**: .NET 10 (ASP.NET Core Web API)
- **Database**: SQLite with Entity Framework Core 10
- **Authentication**: JWT Bearer Tokens & BCrypt password hashing
- **Frontend**: HTML5, CSS3, ES6 JavaScript (served via ASP.NET Core static files)

## 🏁 Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/Dhruv-Langaliya/signularitySGP.git
   ```
2. Run the application:
   ```bash
   dotnet run --project ProjectSimilarity.API
   ```
3. Open your browser at `http://localhost:5200` (or `http://localhost:5000`).
