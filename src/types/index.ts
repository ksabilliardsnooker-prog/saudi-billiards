// User types
export type MemberType = 'player' | 'coach' | 'club' | 'moderator' | 'super_admin'

export type AccountStatus = 
  | 'pending' 
  | 'under_review' 
  | 'returned' 
  | 'approved' 
  | 'active' 
  | 'rejected' 
  | 'suspended'

export interface User {
  id: string
  email: string
  phone: string
  member_type: MemberType
  account_status: AccountStatus
  first_name?: string
  last_name?: string
  club_name?: string
  birth_date?: string
  city: string
  avatar_url?: string
  bio?: string
  social_twitter?: string
  social_instagram?: string
  social_snapchat?: string
  created_at: string
  updated_at: string
}

// Coach info
export interface CoachInfo {
  id: string
  user_id: string
  specialization: 'billiards' | 'snooker' | 'both'
  experience_years: number
  certificates: string[]
  hourly_rate?: number
  available_days?: string[]
  available_hours?: string
  rating_average?: number
  rating_count?: number
}

// Club info
export interface ClubInfo {
  id: string
  user_id: string
  club_name: string
  logo_url?: string
  commercial_registration?: string
  work_license?: string
  address: string
  location_lat?: number
  location_lng?: number
  billiard_tables: number
  snooker_tables: number
  amenities: string[]
  working_hours?: string
  photos: string[]
  rating_average?: number
  rating_count?: number
}

// Verification request
export type VerificationStatus = 'pending' | 'under_review' | 'returned' | 'approved' | 'rejected'

export interface VerificationRequest {
  id: string
  user_id: string
  member_type: 'coach' | 'club'
  status: VerificationStatus
  documents: string[]
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  return_reason?: string
  return_notes?: string
  rejection_reason?: string
  resubmitted_at?: string
  resubmit_count: number
}

// Admin
export interface Admin {
  id: string
  user_id: string
  role: 'super_admin' | 'moderator'
  permissions: string[]
  created_by?: string
  created_at: string
  is_active: boolean
}

// Marketplace
export type ProductCategory = 'tables' | 'cues' | 'shafts' | 'accessories'
export type ProductCondition = 'new' | 'used'

export interface MarketplaceAd {
  id: string
  user_id: string
  title: string
  description: string
  category: ProductCategory
  condition: ProductCondition
  price: number
  images: string[]
  video_url?: string
  city: string
  status: 'active' | 'sold' | 'deleted'
  views: number
  created_at: string
  updated_at: string
  // Joined data
  user?: User
}

// Tournament
export type GameType = 'billiards' | 'snooker'
export type PlaySystem = '8ball' | '9ball' | '10ball'
export type TournamentSystem = 'single' | 'double'
export type ParticipationType = 'individual' | 'team'

export interface Tournament {
  id: string
  club_id: string
  name: string
  description?: string
  game_type: GameType
  play_system: PlaySystem
  tournament_system: TournamentSystem
  participation_type: ParticipationType
  max_participants: number
  current_participants: number
  entry_fee?: number
  prize_first: string
  prize_second: string
  prize_third: string
  start_date: string
  end_date: string
  registration_deadline?: string
  status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled'
  winner_first?: string
  winner_second?: string
  winner_third?: string
  created_at: string
  // Joined data
  club?: ClubInfo
}

export interface TournamentRegistration {
  id: string
  tournament_id: string
  user_id: string
  team_name?: string
  team_members?: string[]
  registered_at: string
  status: 'registered' | 'confirmed' | 'cancelled'
  // Joined data
  user?: User
}

export interface TournamentMatch {
  id: string
  tournament_id: string
  round: number
  match_number: number
  bracket: 'winners' | 'losers' | 'final'
  player1_id?: string
  player2_id?: string
  winner_id?: string
  score_player1?: number
  score_player2?: number
  played_at?: string
  // Joined data
  player1?: User
  player2?: User
}

// Course
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Course {
  id: string
  coach_id: string
  title: string
  description: string
  level: CourseLevel
  price: number
  duration_hours: number
  start_date: string
  end_date?: string
  max_participants: number
  current_participants: number
  location?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  // Joined data
  coach?: User & { coach_info?: CoachInfo }
}

export interface CourseRegistration {
  id: string
  course_id: string
  user_id: string
  registered_at: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'completed'
  // Joined data
  user?: User
}

// Club offer
export interface ClubOffer {
  id: string
  club_id: string
  title: string
  description: string
  discount_percentage?: number
  new_price?: number
  start_date: string
  end_date: string
  terms?: string
  image_url?: string
  status: 'active' | 'expired' | 'deleted'
  created_at: string
  // Joined data
  club?: ClubInfo
}

// News
export type NewsCategory = 'federation' | 'tournaments' | 'general'

export interface News {
  id: string
  title: string
  content: string
  category: NewsCategory
  image_url?: string
  source?: string
  published_at: string
  created_by: string
  status: 'draft' | 'published' | 'archived'
}

// Review
export interface Review {
  id: string
  reviewer_id: string
  reviewed_type: 'club' | 'coach'
  reviewed_id: string
  rating: number
  comment?: string
  created_at: string
  // Joined data
  reviewer?: User
}

// Notification
export type NotificationType = 
  | 'registration'
  | 'verification_update'
  | 'tournament_registration'
  | 'course_registration'
  | 'review'
  | 'message'
  | 'reminder'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

// Form types
export interface RegisterFormData {
  member_type: MemberType
  first_name?: string
  last_name?: string
  club_name?: string
  email: string
  phone: string
  city: string
  birth_date?: string
  password: string
  confirm_password: string
  terms_accepted: boolean
}

export interface LoginFormData {
  email: string
  password: string
  remember_me: boolean
}
