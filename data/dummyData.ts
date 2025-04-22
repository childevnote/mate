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
  category: string;
  content: string;
  author: string;
  university: string;
  likes: number;
  comments: Comment[];
}

function generateComment(): Comment {
  return {
    id: faker.number.int(),
    author: faker.internet.username(),
    content: faker.lorem.paragraph(),
    university: faker.helpers.arrayElement(['서울대학교', '연세대학교', '고려대학교', '한양대학교', '서강대학교']),
    likes: faker.number.int({ min: 0, max: 50 }),
  };
}

function generatePost(): Post {
  return {
    id: faker.number.int(),
    title: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(['입시', '스터디', '정보', '시사', '자유','취업']),
    content: faker.lorem.paragraphs(2),
    author: faker.internet.username(),
    university: faker.helpers.arrayElement(['서울대학교', '연세대학교', '고려대학교', '한양대학교', '서강대학교']),
    likes: faker.number.int({ min: 0, max: 1000 }),
    comments: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, generateComment),
  };
}

export const dummyPosts: Post[] = Array.from({ length: 30 }, generatePost);

