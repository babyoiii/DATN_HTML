export interface GetMovieLandingRes {
  id: string; 
  movieName: string;
  description: string;
  thumbnail: string;
  banner: string;
  duration: number;
  releaseDate: Date;
}
export interface ShowtimesLandingRes {
  id: string;
  startTime: string;
}

export interface GetShowTimeLandingRes {
  id: string;
  movieName: string;
  description: string;
  thumbnail: string;
  trailer: string;
  duration: number;
  releaseDate: Date;
  name :string,
  address :string,
  showtimes: ShowtimesLandingRes[];
}
export interface GetAllNameMovie {
  id: string;
  movieName: string;
  thumbnail?: string;
  trailer?: string;
  duration?: number;
}