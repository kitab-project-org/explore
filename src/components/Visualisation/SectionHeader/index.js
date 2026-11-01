import BookAlignmentHeader from "./BookAlignmentHeader";
import MetadataHeader from "./MetadataHeader";
import SectionHeaderLayout from "./SectionHeaderLayout";
import VisualizationHeader from "./VisualizationHeader";

const SectionHeader = ({ item, component, toggle, setToggle }) => {
  const getHeaderContents = () => {
    if (item.title === "Metadata") {
      return <MetadataHeader />;
    } else if (item.title === "Visualisation") {
      return <VisualizationHeader />;
      /*} else if (item.title === "Books Alignment") {
      return <BookAlignmentHeader />;*/
    } else if (item.title === "Books") {
      return <BookAlignmentHeader />;
    }
  };

  return (
    <SectionHeaderLayout
      item={item}
      component={component}
      toggle={toggle}
      setToggle={setToggle}
    >
      {getHeaderContents()}
    </SectionHeaderLayout>
  );
};

export default SectionHeader;
