WWR-EUTR v1.0.1
https://spplz.github.io/WWR-EUTR/

한국어
1. 게임 PC에서 WWR-EUTR-Bridge.zip을 다운로드하고 압축을 풉니다.
2. Node.js 22 이상을 설치하세요. 위치 플러그인이 없을 때만 게임 종료 후 INSTALL.cmd를 관리자 권한으로 실행합니다. 기존 플러그인은 재설치하지 않습니다.
3. START.cmd를 실행해 연결 프로그램을 켭니다.
4. 웹에서 '유로트럭 연결 요청'을 누릅니다. 브라우저가 이 PC에 대한 연결 권한을 요청하면 허용하세요.
5. PC 승인 화면에서 연결을 승인하면 웹으로 돌아옵니다. '자동 라디오 시작'을 누르세요.
6. '라디오 고정'을 켜면 국가가 바뀌어도 현재 방송을 유지합니다.

Edge/Chrome 데스크톱을 사용하세요. 웹만으로 게임 위치를 읽을 수 없어 연결 프로그램은 필요합니다. 같은 탭의 연결을 최대 24시간 기억하며 연결 프로그램 재시작 시 다시 승인해야 합니다. 국가 판정은 인근 도시 기반 추정으로 게임의 국경 알림과 일치하지 않을 수 있습니다.
기존 WWR 및 WWR-E.T는 별도이며 변경하지 않습니다. 연결 프로그램은 127.0.0.1:8772에서만 대기합니다.

English
Install Node.js 22+, extract WWR-EUTR-Bridge.zip and run START.cmd on the game PC. Install the location plugin with INSTALL.cmd only if absent, while ETS2 is closed. Click the website's connection request button, allow browser access to this PC, approve on the local page, then start automatic radio. Station lock keeps the current station across country changes. Keep the browser tab and bridge running. Country detection is a nearby-city estimate, not the game's border event.

Source: the bridge ZIP includes source, tests, plugin attribution and licenses. No cloud telemetry is used.

Version policy: increment the patch version for every applied update.
버전 정책: 변경사항 적용 때마다 패치 버전을 올립니다.
v1.0.1: 플러그인 설치 상태 점검 및 설정 안내 팝업 추가. 연결 프로그램도 최신 ZIP으로 업데이트하세요.
Custom game path / 사용자 지정 경로: config.json에 "gamePath": "D:/SteamLibrary/steamapps/common/Euro Truck Simulator 2"를 추가할 수 있습니다. 설정 변경 후 연결 프로그램을 재시작하세요.
