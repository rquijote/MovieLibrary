export function AboutPage() {
  return (
    <section className="about-page" aria-labelledby="about-title">
      <h1 id="about-title">About &amp; Credits</h1>
      <p>Movie Library helps you discover movies and TV shows, rate titles, and organize your personal lists.</p>
      <section className="about-attribution" aria-labelledby="tmdb-credit-title">
        <h2 id="tmdb-credit-title">Data and images</h2>
        <a className="tmdb-credit-link" href="https://www.themoviedb.org">
          <img src={`${import.meta.env.BASE_URL}tmdb-logo.svg`} alt="The Movie Database (TMDB)" width="100" />
        </a>
        <p>Movie and TV information, artwork, and account authentication are provided by The Movie Database (TMDB).</p>
        <p className="tmdb-disclaimer">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </section>
    </section>
  );
}
