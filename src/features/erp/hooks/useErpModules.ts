import { erpModulesMeta, type ErpModuleMeta } from '../data/erpModulesMeta';

// Primary hook used by the new router and module pages, based on metadata only.
export function useErpModules() {
  const getAllModules = (): ErpModuleMeta[] => erpModulesMeta;

  const getModuleBySlug = (slug: string): ErpModuleMeta | undefined =>
    erpModulesMeta.find((m) => m.slug === slug);

  return { getAllModules, getModuleBySlug };
}

