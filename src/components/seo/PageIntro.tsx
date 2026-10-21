import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { breadcrumbList, type Crumb } from "@/lib/seo";

export function PageIntro({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs: Crumb[];
}) {
  return (
    <>
      <JsonLd data={breadcrumbList(crumbs)} />
      <PageHero title={title} subtitle={subtitle} crumbs={crumbs} />
    </>
  );
}
