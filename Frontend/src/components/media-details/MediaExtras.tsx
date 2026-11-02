import type { VideoListDto } from '../../types/media';

interface MediaExtrasProps {
  videos?: VideoListDto | null;
}

export function MediaExtras({ videos }: MediaExtrasProps) {
  const youtubeVideos = videos?.results.filter((video) => video.site === 'YouTube' && video.key) ?? [];

  return (
    <>
      {youtubeVideos.length > 0 ? (
        <section className="media-detail-section">
          <h2>Trailers &amp; Videos</h2>
          <div className="video-list">
            {youtubeVideos.slice(0, 8).map((video) => (
              <a
                className="video-card"
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.key)}`}
                key={video.id}
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden="true">▶</span>
                <span>{video.name}</span>
                <small>{video.type}{video.official ? ' · Official' : ''}</small>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
