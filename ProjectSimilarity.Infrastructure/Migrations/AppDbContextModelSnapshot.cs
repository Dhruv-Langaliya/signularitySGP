using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ProjectSimilarity.Infrastructure.Data;

#nullable disable

namespace ProjectSimilarity.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "10.0.4");

            modelBuilder.Entity("ProjectSimilarity.Core.Entities.Project", b =>
            {
                b.Property<Guid>("Id")
                    .HasColumnType("TEXT");

                b.Property<string>("AcademicYear")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<DateTime>("CreatedAt")
                    .HasColumnType("TEXT");

                b.Property<string>("Domain")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<string>("FilePath")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<int>("Status")
                    .HasColumnType("INTEGER");

                b.Property<string>("Technologies")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<Guid>("UploadedBy")
                    .HasColumnType("TEXT");

                b.HasKey("Id");

                b.HasIndex("UploadedBy");

                b.ToTable("Projects");
            });

            modelBuilder.Entity("ProjectSimilarity.Core.Entities.SimilarityResult", b =>
            {
                b.Property<Guid>("Id")
                    .HasColumnType("TEXT");

                b.Property<DateTime>("CreatedAt")
                    .HasColumnType("TEXT");

                b.Property<Guid>("MatchedProjectId")
                    .HasColumnType("TEXT");

                b.Property<int>("RiskLevel")
                    .HasColumnType("INTEGER");

                b.Property<string>("ReportPath")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<decimal>("SimilarityScore")
                    .HasPrecision(10, 6)
                    .HasColumnType("TEXT");

                b.Property<Guid>("SourceProjectId")
                    .HasColumnType("TEXT");

                b.HasKey("Id");

                b.HasIndex("MatchedProjectId");

                b.HasIndex("SourceProjectId");

                b.ToTable("SimilarityResults");
            });

            modelBuilder.Entity("ProjectSimilarity.Core.Entities.User", b =>
            {
                b.Property<Guid>("Id")
                    .HasColumnType("TEXT");

                b.Property<DateTime>("CreatedAt")
                    .HasColumnType("TEXT");

                b.Property<string>("Department")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<string>("Email")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<string>("Name")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<string>("PasswordHash")
                    .IsRequired()
                    .HasColumnType("TEXT");

                b.Property<int>("Role")
                    .HasColumnType("INTEGER");

                b.HasKey("Id");

                b.HasIndex("Email")
                    .IsUnique();

                b.ToTable("Users");
            });

            modelBuilder.Entity("ProjectSimilarity.Core.Entities.Project", b =>
            {
                b.HasOne("ProjectSimilarity.Core.Entities.User", "UploadedByUser")
                    .WithMany()
                    .HasForeignKey("UploadedBy")
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                b.Navigation("UploadedByUser");
            });

            modelBuilder.Entity("ProjectSimilarity.Core.Entities.SimilarityResult", b =>
            {
                b.HasOne("ProjectSimilarity.Core.Entities.Project", "MatchedProject")
                    .WithMany()
                    .HasForeignKey("MatchedProjectId")
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                b.HasOne("ProjectSimilarity.Core.Entities.Project", "SourceProject")
                    .WithMany()
                    .HasForeignKey("SourceProjectId")
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                b.Navigation("MatchedProject");
                b.Navigation("SourceProject");
            });
        }
    }
}
