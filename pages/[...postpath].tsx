import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const endpoint = "https://www.love.khao.today/graphql"
	const graphQLClient = new GraphQLClient(endpoint);
	const referringURL = ctx.req.headers?.referer || null;
	const pathArr = ctx.query.postpath as Array<string>;
	const path = pathArr.join('/');
	console.log(path);
	const fbclid = ctx.query.fbclid;

	// redirect if facebook is the referer or request contains fbclid
		if (referringURL?.includes('facebook.com') || fbclid) {

		return {
			redirect: {
				permanent: false,
				destination: `${
					`https://www.love.khao.today/` + encodeURI(path as string)
				}`,
			},
		};
		}
	const query = gql`
		{
			post(id: "/${path}/", idType: URI) {
				id
				excerpt
				title
				link
				dateGmt
				modifiedGmt
				content
				author {
					node {
						name
					}
				}
				featuredImage {
					node {
						sourceUrl
						altText
					}
				}
			}
		}
	`;

	const data = await graphQLClient.request(query);
	if (!data.post) {
		return {
			notFound: true,
		};
	}
	return {
		props: {
			path,
			post: data.post,
			host: ctx.req.headers.host,
		},
	};
};

interface PostProps {
	post: any;
	host: string;
	path: string;
}

const Post: React.FC<PostProps> = (props) => {
	const { post, host, path } = props;

	// to remove tags from excerpt
	const removeTags = (str: string) => {
		if (str === null || str === '') return '';
		else str = str.toString();
		return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
	};

	return (
		<>
			<Head>
				<meta property="og:url"                content="https://www.thainewsnow.com/" />
				<meta property="og:type"               content="article" />
				<meta property="og:title"              content="Relax Every Day With Sac Dep Spa 48" />
				<meta property="og:description"        content="Relax Every Day With Sac Dep Spa 48" />
				<meta property="og:image"              content="https://www.thainewsnow.com/wp-content/uploads/2023/03/image-23-1024x576-1-1.png" />
				<meta property="og:image:widts" content="1024">   
				<meta property="og:image:height" content="1024">
					property="og:image:alt"
					content={post.featuredImage.node.altText || post.title}
				/>
				<title>{post.title}</title>
			</Head>
			<div className="post-container">
				<h1>{post.title}</h1>
				<img
					src={post.featuredImage.node.sourceUrl}
					alt={post.featuredImage.node.altText || post.title}
				/>
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
