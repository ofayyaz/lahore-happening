import { ApolloProvider } from '@apollo/client';
import { useRouter } from 'next/router';
import apolloClient from '../lib/apolloClient';
import '../styles/globals.css';
import AdminLayout from '../components/admin/AdminLayout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <ApolloProvider client={apolloClient}>
      {isAdminPage ? (
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      ) : (
        <Component {...pageProps} />
      )}
    </ApolloProvider>
  );
}

export default MyApp;

/*
    */