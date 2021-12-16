import React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { useCreateOnePostMutation } from '@fullstack/data-access';

export interface CreatePostProps { }

export function CreatePost(props: CreatePostProps) {

    // const { loading, error, data } = useCreateOnePostMutation();

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error :(</p>;
    // if (data?.posts?.length === 0) return <p>No posts :|</p>;

    const createrandomPost = (): void => {
        const title = `this is post title ${(Math.random() * 100 / 10)}`;
        const description = `this is post description ${(Math.random() * 100 / 10)}`;
        const id = "facinick";
    }

    return (
        <Card variant="outlined">
            <Button onClick={createrandomPost} variant="contained">Contained</Button>
        </Card>
    );
}

export default CreatePost;
