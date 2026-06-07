# SOOP Participation Tracker

SOOP 방송 링크를 기준으로 방송 메타데이터, 시청자 수 스냅샷, 채팅 이벤트를 저장하고 참여 유저 패턴을 분석하는 로컬 프로토타입입니다.

## 현실적인 수집 범위

안정적으로 권장하는 범위는 다음입니다.

- 본인 방송 또는 명시적으로 허가받은 방송의 공개/공식 데이터
- 방송 제목, 카테고리, 해시태그, 시작/종료 시각
- 시간대별 전체 시청자 수 스냅샷
- 채팅을 실제로 남긴 유저의 시각, 메시지 수, 메시지 내용 또는 내용 없는 카운트

주의해야 할 범위는 다음입니다.

- 조용히 보기만 하는 시청자의 개인별 입장/퇴장 추적은 일반적으로 공식 권한 없이는 불가능하거나 부적절합니다.
- 채팅하지 않은 유저의 식별 정보, 비공개 API, 로그인 세션 탈취, 브라우저 내부 요청 복제, 역공학 기반 수집은 피해야 합니다.
- 유저 ID, 닉네임, 메시지 내용은 개인정보 또는 개인 관련 데이터가 될 수 있으므로 최소 수집, 보관 기간, 접근 권한, 삭제 요청 대응을 정해야 합니다.

따라서 이 프로토타입은 "방문자 전체 추적"이 아니라 "실질적으로 참여한 유저 분석"에 초점을 둡니다. 누가 언제 들어왔는지는 채팅 첫 등장 시각으로만 추정하고, 침묵 시청자는 전체 시청자 수 변화로만 봅니다.

## 데이터 모델

- `streams`: 방송 단위. 방송 링크, 방송자 ID, 시작/종료 시각을 저장합니다.
- `broadcast_snapshots`: 특정 시점의 제목, 카테고리, 해시태그, 전체 시청자 수를 저장합니다.
- `chat_events`: 채팅/후원/시스템성 이벤트를 저장합니다.

유저는 기본적으로 `SOOP_TRACKER_SALT`로 HMAC 처리한 `user_key`로 저장합니다. `--store-nicknames`를 쓰면 닉네임도 저장하지만, 장기 운영 전에는 고지/동의/보관 정책을 먼저 정하는 편이 좋습니다.

## 빠른 실행

```powershell
cd C:\Users\grand\Documents\Playground\soop-tracker
python .\soop_tracker.py init
python .\soop_tracker.py ingest-chat-jsonl --file .\sample_events.jsonl --store-nicknames
python .\soop_tracker.py report
```

## 웹에서 열기

GitHub Pages 배포 대상인 `public/soop-tracker/`에 정적 웹앱도 포함했습니다.

로컬 미리보기:

```powershell
cd C:\Users\grand\Documents\Playground
npm start
```

브라우저에서 여는 주소:

```text
http://127.0.0.1:3000/soop-tracker/index.html
```

GitHub Pages 배포 후 예상 주소:

```text
https://Dobaisnotdobi.github.io/HSHCOMPANY_M/soop-tracker/
```

웹앱은 JSONL/JSON/CSV 파일을 브라우저에서만 읽고 `localStorage`에 저장합니다. 서버 DB가 없기 때문에 개인별 장기 수집은 로컬 파일 또는 별도 백엔드 연동이 필요합니다.

## 입력 JSONL 형식

한 줄에 하나의 JSON 객체를 넣습니다.

```json
{"timestamp":"2026-06-07T20:03:12+09:00","stream_url":"https://play.sooplive.com/example_bj","title":"저녁 소통","category":"talk","viewer_count":128,"event_type":"chat","user_id":"user123","nickname":"시청자A","message":"안녕하세요"}
```

필수에 가까운 값은 `timestamp`, `stream_url`, `event_type`입니다. 채팅 분석에는 `user_id` 또는 `nickname` 중 하나가 필요합니다.

## 실제 SOOP 연동 방향

1. SOOP Developers에서 애플리케이션을 만들고 공식 Open API 권한을 확인합니다.
2. 방송 정보는 공식 Open API의 인증 플로우와 방송 정보 엔드포인트를 우선 사용합니다.
3. 채팅은 SOOP에서 제공하는 공식 CHAT 컴포넌트, 스트리머 도구, 다운로드 가능한 채팅 로그, 또는 본인이 명시적으로 허가받은 이벤트 소스만 어댑터로 연결합니다.
4. 공식 API에서 개인별 입장/퇴장이 제공되지 않으면 저장하지 않습니다. 대신 채팅 첫 등장, 마지막 채팅, 메시지 빈도, 제목별 반응으로 분석합니다.

## 리포트 해석

- `Top active users`: 메시지 수, 첫/마지막 등장, 활동 시간 버킷 수를 보여줍니다.
- `Hourly engagement`: 요일/시간대별 채팅량을 보여줍니다.
- `Title affinity`: 방송 제목별로 어떤 유저가 많이 반응했는지 보여줍니다.
- `Viewer snapshots`: 제목별 전체 시청자 수 변화를 요약합니다.
