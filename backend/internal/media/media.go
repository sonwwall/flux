package media

import (
	"path/filepath"
	"runtime"
)

func UploadRoot() string {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		return "uploads"
	}
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "uploads"))
}

func ImageDir() string {
	return filepath.Join(UploadRoot(), "images")
}

func AudioDir() string {
	return filepath.Join(UploadRoot(), "audio")
}
