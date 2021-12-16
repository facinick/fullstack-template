import React from 'react';
import { useAllPostsQueryQuery } from '@fullstack/data-access';
import './post-list.module.scss';
import Card from '@mui/material/Card';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AllPostsProps { }

export function AllPosts(props: AllPostsProps) {
  const { loading, error, data } = useAllPostsQueryQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  if (data?.posts?.length === 0) return <p>No posts :|</p>;

  return (
    <Card variant="outlined">
      {
        data?.posts?.map((post) => {
          if (!post) {
            return (<Typography>Post is null :\</Typography>)
          } else {
            return (
              <Accordion key={post.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{post.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {`${post.description} -  by ${post.author.id}`}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )
          }
        })
      }
    </Card>
  );
}

export default AllPosts;
