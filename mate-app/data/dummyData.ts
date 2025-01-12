import { faker } from '@faker-js/faker';

export interface Comment {
  id: number;
  author: string;
  content: string;
  university: string;
  likes: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  university: string;
  likes: number;
  comments: Comment[];
}

function generateComment(): Comment {
  return {
    id: faker.number.int(),
    author: faker.internet.userName(),
    content: faker.lorem.paragraph(),
    university: faker.helpers.arrayElement(['서울대학교', '연세대학교', '고려대학교', '한양대학교', '서강대학교']),
    likes: faker.number.int({ min: 0, max: 50 }),
  };
}

function generatePost(): Post {
  return {
    id: faker.number.int(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    author: faker.internet.userName(),
    university: faker.helpers.arrayElement(['서울대학교', '연세대학교', '고려대학교', '한양대학교', '서강대학교']),
    likes: faker.number.int({ min: 0, max: 1000 }),
    comments: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, generateComment),
  };
}

export const dummyPosts: Post[] = Array.from({ length: 30 }, generatePost);

