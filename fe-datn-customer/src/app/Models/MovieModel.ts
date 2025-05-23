export interface GetMovieLandingRes {
  id: string;
  movieName: string;
  description: string;
  thumbnail: string;
  banner: string;
  trailer?: string; // Thêm trailer dưới dạng optional
  duration: number;
  releaseDate: Date;
  status: number; // Thêm thuộc tính status
  ageRatingCode?: string; // Thêm mã độ tuổi
  ageRatingId?: string; // Thêm ID độ tuổi
  rate?: number; // Thêm thuộc tính Rate
}
export interface ShowtimesLandingRes {
  id: string;
  startTime: string;
  roomTypeId: string;
  roomTypeName: string;
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
export interface MovieByShowtimeData {
  thumbnail: string; 
  movieName: string; 
  cinemaName: string; 
  cinemaAddress: string; 
  minimumAge: number;
  startTime: string; 
  startTimeFormatted: string;
  durationFormatted: string;
  averageRating?: number; 
  roomTypeName: string;
}
export interface GetMovieType {
  formatId: string; 
  name: string;    
}