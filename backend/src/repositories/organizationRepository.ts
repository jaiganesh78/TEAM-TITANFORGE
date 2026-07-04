import { prisma } from '../database/prisma';
import { Organization, Prisma } from '@prisma/client';

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
      include: { users: true },
    });
  }

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Organization> {
    return prisma.organization.delete({
      where: { id },
    });
  }
}
export const organizationRepository = new OrganizationRepository();
