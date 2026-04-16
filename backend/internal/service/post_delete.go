package service

func (s *Service) DeletePost(id uint) error {
	return s.dao.DeletePost(id)
}
