namespace ProjectSimilarity.API.Constants;

public static class AuthConstants
{
    public const string BaseRoute = "api/auth";
    public const string RegisterRoute = "register";
    public const string LoginRoute = "login";

    public const string ProjectBaseRoute = "api/projects";
    public const string ProjectUploadRoute = "upload";
    public const string SimilarityBaseRoute = "api/similarity";
    public const string SimilarityRunRoute = "run";
    public const string SimilarityResultsRoute = "results";
    public const string AdminBaseRoute = "api/admin";
    public const string AdminDashboardRoute = "dashboard";

    public const string StudentRole = "Student";
    public const string FacultyRole = "Faculty";
    public const string AdminRole = "Admin";
    public const string StudentFacultyAdminRoles = "Student,Faculty,Admin";
    public const string FacultyAdminRoles = "Faculty,Admin";
    public const string AdminOnlyRole = "Admin";

    public const string AllFieldsRequired = "All fields are required.";
    public const string InvalidRole = "Invalid role.";
    public const string EmailAlreadyExists = "Email already exists.";
    public const string RegistrationSuccessful = "Registration successful.";
    public const string EmailAndPasswordRequired = "Email and password are required.";
    public const string InvalidCredentials = "Invalid credentials.";

    public const string JwtSecretKey = "Jwt:Secret";
    public const string JwtIssuerKey = "Jwt:Issuer";
    public const string JwtAudienceKey = "Jwt:Audience";

    public const string UserIdClaim = "userId";
    public const string CorsPolicyName = "AllowAll";
    public const string UploadsFolderName = "uploads";
    public const string ProjectUploadRequiredMessage = "Title, domain, academic year, and file are required.";
    public const string InvalidUserTokenMessage = "Invalid user token.";
    public const string InvalidProjectFileMessage = "Only PDF, DOCX, C#, JavaScript, Python, and text files up to 10 MB are supported.";
    public const long MaxProjectFileSize = 10 * 1024 * 1024;
    public const string SwaggerDocumentName = "v1";
    public const string SwaggerTitle = "ProjectSimilarity API";
    public const string SwaggerSecuritySchemeName = "Bearer";
    public const string SwaggerBearerFormat = "JWT";
    public const string AuthorizationHeaderName = "Authorization";
    public const int JwtExpirationDays = 7;
}
