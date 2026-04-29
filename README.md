# Naver Cafe Random Player

공개 네이버 카페 게시판 20페이지에서 유튜브 링크를 수집해 랜덤 재생하는 정적 웹앱입니다.

## 특징

- 링크만 열면 바로 사용할 수 있는 공개 웹앱
- YouTube 임베드 플레이어와 원글 링크 박스 제공
- 좋아요 / 싫어요를 각 사용자 브라우저 `localStorage` 에만 저장
- 자동 갱신 실행 중에는 `[목록 갱신중>.O]` 팝업 표시
- GitHub Pages + GitHub Actions 기반의 무서버 배포 구조

## 로컬 사용

1. 최신 플레이리스트 생성

```powershell
npm run build:playlist
```

2. 정적 사이트 미리보기

```powershell
npm start
```

3. 브라우저에서 열기

```text
http://127.0.0.1:3000
```

## GitHub Pages 배포

1. 이 프로젝트를 GitHub의 public repository로 올립니다.
2. 저장소 `Settings > Pages` 에서 `Source` 를 `GitHub Actions` 로 설정합니다.
3. 기본 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml` 이 실행됩니다.
4. 배포가 끝나면 아래 형식의 공개 링크로 바로 접속할 수 있습니다.

```text
https://<github-user>.github.io/<repository-name>/
```

## 배포 방식

- `Deploy GitHub Pages` 워크플로는 저장소에 커밋된 `public/` 폴더를 일반 변경 배포에 사용합니다.
- `Refresh Playlist` 워크플로는 한국 시간 기준 매일 새벽 4시에 네이버 카페를 다시 수집해 `public/playlist.json` 을 갱신합니다.
- 수집 워크플로는 변경이 있을 때 `playlist.json` 을 커밋한 뒤, 같은 실행 안에서 GitHub Pages까지 다시 배포합니다.
- 사이트는 가장 최근에 배포된 공개 `playlist.json` 을 기준으로 동작하며, 페이지가 열려 있는 동안 갱신 완료가 감지되면 최신 목록을 다시 불러옵니다.
- 수집 실패가 나도 기존 공개 사이트는 그대로 유지되고, 성공했을 때만 최신 목록으로 교체됩니다.

플레이리스트를 수동으로 최신화하고 싶다면 로컬에서도 아래 명령을 실행할 수 있습니다.

```powershell
npm run build:playlist
```

## 참고

- 공개 링크로 접속하는 사용자는 서버 없이 정적 파일만 받습니다.
- 실제 수집 스크립트는 `scripts/build-playlist.js` 이며, 로컬 또는 `Refresh Playlist` 워크플로에서 실행됩니다.
- 게시판 구조가 바뀌면 수집 스크립트 수정이 필요할 수 있습니다.
