using Microsoft.EntityFrameworkCore;
using ProjectSimilarity.Core.Entities;
using System.Text.Json;

using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace ProjectSimilarity.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<SimilarityResult> SimilarityResults => Set<SimilarityResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var listComparer = new ValueComparer<List<string>>(
            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList());

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Name).IsRequired();
            entity.Property(user => user.Email).IsRequired();
            entity.Property(user => user.PasswordHash).IsRequired();
            entity.Property(user => user.Department).IsRequired();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(project => project.Id);
            entity.Property(project => project.Title).IsRequired();
            entity.Property(project => project.Domain).IsRequired();
            entity.Property(project => project.AcademicYear).IsRequired();
            entity.Property(project => project.FilePath).IsRequired();
            entity.Property(project => project.Technologies)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
                    value => string.IsNullOrWhiteSpace(value)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(value, (JsonSerializerOptions?)null) ?? new List<string>(),
                    listComparer)
                .HasColumnType("TEXT");

            entity.HasOne(project => project.UploadedByUser)
                .WithMany()
                .HasForeignKey(project => project.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SimilarityResult>(entity =>
        {
            entity.HasKey(result => result.Id);
            entity.Property(result => result.ReportPath).IsRequired();
            entity.Property(result => result.SimilarityScore).HasPrecision(10, 6);

            entity.HasOne(result => result.SourceProject)
                .WithMany()
                .HasForeignKey(result => result.SourceProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(result => result.MatchedProject)
                .WithMany()
                .HasForeignKey(result => result.MatchedProjectId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}