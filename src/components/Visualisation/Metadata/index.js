import { useContext, useState } from "react";
import { Box } from "@mui/material";

import Section from "./Section";
import MetadataHeader from "../SectionHeader/MetadataHeader";
import SectionHeaderLayout from "../SectionHeader/SectionHeaderLayout";
import { Context } from "../../../App";

const BookMetadata = () => {
  console.log("Rendering BookMetaData section");
  const { isFlipped, metaData } = useContext(Context);
  console.log(metaData);
  const [toggle, setToggle] = useState(true);

  return (
    <>
      <SectionHeaderLayout
        item={{ title: "Metadata", icon: "fa-solid fa-bars" }}
        toggle={toggle}
        setToggle={setToggle}
      >
        <MetadataHeader />
      </SectionHeaderLayout>
      {toggle && (
        <Box
          pt="10px"
          pb={"30px"}
          sx={{
            px: {
              xs: "5px",
              sm: 5,
            },
          }}
        >
          <Box
            display={"flex"}
            sx={{
              flexDirection: {
                xs: "column",
                md: "row",
              },
            }}
          >
            <Section data={isFlipped ? metaData?.book2 : metaData?.book1} />
            <Section data={isFlipped ? metaData?.book1 : metaData?.book2} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default BookMetadata;
