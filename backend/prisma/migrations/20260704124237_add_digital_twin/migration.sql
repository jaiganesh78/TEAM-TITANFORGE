-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "summary" TEXT,
    "vision" TEXT,
    "mission" TEXT,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessIdentity" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "websiteUrl" TEXT,

    CONSTRAINT "BusinessIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessModel" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" TEXT,
    "valueProposition" TEXT,
    "keyPartners" TEXT,
    "keyActivities" TEXT,
    "keyResources" TEXT,
    "costStructure" TEXT,
    "revenueStreams" TEXT,

    CONSTRAINT "BusinessModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "mrr" DOUBLE PRECISION,
    "arr" DOUBLE PRECISION,
    "grossMargin" DOUBLE PRECISION,
    "growthRate" DOUBLE PRECISION,

    CONSTRAINT "RevenueProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPortfolio" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "salesVolume" INTEGER,

    CONSTRAINT "ProductPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePortfolio" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER,

    CONSTRAINT "ServicePortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSegment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "segmentName" TEXT NOT NULL,
    "cac" DOUBLE PRECISION,
    "ltv" DOUBLE PRECISION,
    "churnRate" DOUBLE PRECISION,
    "description" TEXT,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPersona" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "demographics" TEXT,
    "painPoints" TEXT,
    "coreBehaviors" TEXT,

    CONSTRAINT "CustomerPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "adSpend" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "channelsUsed" TEXT,
    "conversions" TEXT,

    CONSTRAINT "MarketingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "leadsCount" INTEGER,
    "conversionRate" DOUBLE PRECISION,
    "pipelineValue" DOUBLE PRECISION,
    "salesCycleDays" INTEGER,

    CONSTRAINT "SalesProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "infraCost" DOUBLE PRECISION,
    "supportTicketsCount" INTEGER,
    "avgResolutionTimeMs" INTEGER,
    "bottlenecks" TEXT,

    CONSTRAINT "OperationsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "infraProvider" TEXT,
    "coreFrameworks" TEXT,
    "databases" TEXT,
    "integrations" TEXT,
    "securityCertification" TEXT,

    CONSTRAINT "TechnologyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationStructure" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "headcount" INTEGER,
    "orgChartLink" TEXT,

    CONSTRAINT "OrganizationStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "avgSalary" DOUBLE PRECISION,
    "turnoverRate" DOUBLE PRECISION,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "serviceCategory" TEXT,
    "contractCost" DOUBLE PRECISION,
    "contractEnd" TIMESTAMP(3),

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnershipType" TEXT,
    "dependencyLevel" TEXT,

    CONSTRAINT "PartnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "marketShare" DOUBLE PRECISION,

    CONSTRAINT "CompetitorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessGoal" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "progress" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "BusinessGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessConstraint" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "limitValue" TEXT,

    CONSTRAINT "BusinessConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRisk" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "likelihood" TEXT,
    "impact" TEXT,
    "mitigation" TEXT,

    CONSTRAINT "BusinessRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessKPI" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "unit" TEXT,

    CONSTRAINT "BusinessKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDocumentReference" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessDocumentReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteReference" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "crawledAt" TIMESTAMP(3),

    CONSTRAINT "WebsiteReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryProgress" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "overallCoverage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "identityStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "modelStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "productsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "customersStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "marketingStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "salesStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "operationsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "financeStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "technologyStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "partnersStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "competitorsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "goalsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "constraintsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "risksStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "kpisStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "documentsStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "websiteStatus" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "DiscoveryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwinAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwinAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Business_organizationId_idx" ON "Business"("organizationId");

-- CreateIndex
CREATE INDEX "Business_status_idx" ON "Business"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_businessId_key" ON "BusinessProfile"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessIdentity_businessId_key" ON "BusinessIdentity"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessModel_businessId_key" ON "BusinessModel"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingProfile_businessId_key" ON "MarketingProfile"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesProfile_businessId_key" ON "SalesProfile"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationsProfile_businessId_key" ON "OperationsProfile"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyProfile_businessId_key" ON "TechnologyProfile"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStructure_businessId_key" ON "OrganizationStructure"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryProgress_businessId_key" ON "DiscoveryProgress"("businessId");

-- CreateIndex
CREATE INDEX "TwinAuditLog_businessId_idx" ON "TwinAuditLog"("businessId");

-- CreateIndex
CREATE INDEX "TwinAuditLog_userId_idx" ON "TwinAuditLog"("userId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessIdentity" ADD CONSTRAINT "BusinessIdentity_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessModel" ADD CONSTRAINT "BusinessModel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueProfile" ADD CONSTRAINT "RevenueProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPortfolio" ADD CONSTRAINT "ProductPortfolio_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePortfolio" ADD CONSTRAINT "ServicePortfolio_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSegment" ADD CONSTRAINT "CustomerSegment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPersona" ADD CONSTRAINT "CustomerPersona_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingProfile" ADD CONSTRAINT "MarketingProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesProfile" ADD CONSTRAINT "SalesProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsProfile" ADD CONSTRAINT "OperationsProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnologyProfile" ADD CONSTRAINT "TechnologyProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStructure" ADD CONSTRAINT "OrganizationStructure_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorProfile" ADD CONSTRAINT "CompetitorProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessGoal" ADD CONSTRAINT "BusinessGoal_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessConstraint" ADD CONSTRAINT "BusinessConstraint_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRisk" ADD CONSTRAINT "BusinessRisk_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessKPI" ADD CONSTRAINT "BusinessKPI_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDocumentReference" ADD CONSTRAINT "BusinessDocumentReference_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteReference" ADD CONSTRAINT "WebsiteReference_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryProgress" ADD CONSTRAINT "DiscoveryProgress_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinAuditLog" ADD CONSTRAINT "TwinAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinAuditLog" ADD CONSTRAINT "TwinAuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
