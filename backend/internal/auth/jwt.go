package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var ErrInvalidToken = errors.New("invalid token")

func Issue(secret string) (string, error) {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payload, _ := json.Marshal(map[string]any{"exp": time.Now().Add(30 * 24 * time.Hour).Unix()})
	claims := base64.RawURLEncoding.EncodeToString(payload)
	return header + "." + claims + "." + sign(secret, header+"."+claims), nil
}

func Verify(secret, token string) error {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return ErrInvalidToken
	}
	if sign(secret, parts[0]+"."+parts[1]) != parts[2] {
		return ErrInvalidToken
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ErrInvalidToken
	}
	var claims map[string]any
	if err := json.Unmarshal(raw, &claims); err != nil {
		return ErrInvalidToken
	}
	exp, _ := claims["exp"].(float64)
	if time.Now().Unix() > int64(exp) {
		return ErrInvalidToken
	}
	return nil
}

func sign(secret, data string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
