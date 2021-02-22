import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Hero from '../components/Hero';
import Movie from '../types/interfaces/movie';

export default function Home({
  movie,
  image,
}: {
  movie: Movie;
  image: string;
}) {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Hero movie={movie} image={image} />
        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const client = new ApolloClient({
    uri: 'https://easy-leech-90.hasura.app/v1/graphql',
    cache: new InMemoryCache(),
  });

  const { data } = await client.query({
    query: gql`
      query GetNextMovie($limit: Int = 1) {
        movies(
          where: { completion_date: { _gte: "2021-02-21" } }
          order_by: { completion_date: desc_nulls_last }
          limit: $limit
        ) {
          name
          rating
          rotten_tomatoes
          watch_link
          imdb_link
          completion_date
          tmdb_id
        }
      }
    `,
  });

  const TMDB_API_KEY = 'c267d643500a108d8c9a5b468acc0bae';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const tmdb_id = data?.movies[0].tmdb_id ?? null;

  const tmdbMovieRes = await fetch(
    `${TMDB_BASE_URL}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}`
  );
  const tmdbConfigRes = await fetch(
    `${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`
  );

  const tmdbConfigData = await tmdbConfigRes.json();
  const tmdbMovieData = await tmdbMovieRes.json();

  const {
    images: { secure_base_url: secureBaseUrl },
  } = tmdbConfigData;
  const { backdrop_path: backdropPath } = tmdbMovieData;
  console.log(data);
  console.log(tmdbConfigData);
  console.log(tmdbMovieData);
  return {
    props: {
      movie: data.movies[0],
      image: `${secureBaseUrl}/w780/${backdropPath}`,
    },
  };
}
