import Layout from "../components/Common/Layouts";
import MetadataTable from "../components/CorpusMetadata";

const CorpusMetadata = ({ isHome }) => {
  return (
    <Layout>
      <MetadataTable isHome={isHome} />
    </Layout>
  );
};

export default CorpusMetadata;
