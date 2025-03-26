import { publicProcedure } from "../trpc"

export const getFeaturedMediasHandler = publicProcedure.query(async () => {
  console.log("getFeaturedMediasHandler")

  return {
    id: "1",
    title: "Featured Media 1",
    description: "Featured Media 1 Description",
    image: "https://via.placeholder.com/150",
    link: "https://via.placeholder.com/150",
  }
})
