import { Card, Col, Eyebrow, LinkUnderline, SectionGrid } from "@/components/ds";
import { allMedia, type MediaAsset } from "@/media";

const LICENSE_SUMMARY = "https://pixabay.com/service/license-summary/";

// One Pixabay item can back several manifest entries (the hero loop and the full hero video).
function uniqueSources(assets: MediaAsset[]): MediaAsset[] {
  const seen = new Set<number>();
  return assets.filter(({ pixabayId }) => !seen.has(pixabayId) && seen.add(pixabayId));
}

const Credits = () => {
  const sources = uniqueSources(allMedia());

  return (
    <div className="container py-16 lg:py-24">
      <SectionGrid className="px-0 lg:px-0">
        <Col span={8}>
          <Eyebrow>Atribusi</Eyebrow>
          <h1 className="text-heading-1 mt-4 text-ink-strong">Kredit media</h1>
          <p className="text-body-md mt-6 max-w-[720px] text-ink">
            Video dan foto di situs ini berasal dari Pixabay dan dipakai di bawah{" "}
            <LinkUnderline href={LICENSE_SUMMARY} target="_blank" rel="noopener noreferrer" className="text-link">
              Pixabay Content License
            </LinkUnderline>
            .
          </p>
        </Col>

        <Col className="mt-12">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((asset) => (
              <li key={asset.pixabayId}>
                <Card className="flex h-full flex-col gap-4">
                  <img
                    src={asset.kind === "video" ? asset.poster : asset.src}
                    alt=""
                    loading="lazy"
                    width={asset.width}
                    height={asset.height}
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                  <div className="text-body-sm">
                    <p className="font-medium text-ink-strong">oleh {asset.user}</p>
                    <p className="text-steel">{asset.license}</p>
                  </div>
                  <LinkUnderline
                    href={asset.pageURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm mt-auto self-start text-link"
                  >
                    Lihat di Pixabay
                  </LinkUnderline>
                </Card>
              </li>
            ))}
          </ul>
        </Col>
      </SectionGrid>
    </div>
  );
};

export default Credits;
