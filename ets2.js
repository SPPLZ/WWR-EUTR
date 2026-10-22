(() => {
  const box=document.createElement('section');box.className='ets2-control';box.setAttribute('aria-label','유로트럭 지역 라디오');
  box.innerHTML='<div class="et-heading"><span>EURO TRUCK RADIO</span><button id="etConnect" type="button">유로트럭 연결 요청</button></div><p id="etsRegion" role="status">PC와 연결하면 현재 국가의 라디오를 찾아드려요.</p><div class="et-controls"><button id="etsAuto" aria-pressed="false" disabled>자동 라디오 시작</button><button id="etsLock" aria-pressed="false">라디오 고정</button><button id="etsNext" disabled>다른 방송국</button></div><details><summary>처음 연결하나요?</summary><p>웹 연결에는 게임 PC의 연결 프로그램이 필요합니다.<br>① <a href="WWR-EUTR-Bridge.zip" download>PC 연결 프로그램 다운로드</a><br>② Node.js 22 이상 설치 후 압축을 풀고 START.cmd 실행<br>③ ‘유로트럭 연결 요청’ → 연결 승인 → 자동 라디오 시작</p><p>처음 사용하는 PC는 INSTALL.cmd로 위치 플러그인을 설치한 뒤 게임을 다시 실행하세요. 기존 플러그인이 있으면 재설치하지 않아도 됩니다.</p><a href="http://127.0.0.1:8772/" target="_blank" rel="noopener">PC 연결 화면 열기 ↗</a></details>';
  document.getElementById('stationPanel').prepend(box);
  const connect=box.querySelector('#etConnect'),bridgeURL='http://127.0.0.1:8772';
  let bridgeToken='';
  try{const incoming=new URLSearchParams(location.hash.slice(1)).get('wwreutr-token');
    if(incoming!==null){history.replaceState(null,'',location.pathname+location.search);if(/^[a-f0-9]{64}$/.test(incoming))sessionStorage.setItem('wwreutr-bridge-session',incoming);}
    bridgeToken=sessionStorage.getItem('wwreutr-bridge-session')||'';
    if(!/^[a-f0-9]{64}$/.test(bridgeToken))bridgeToken='';
  }catch{}
  function forgetConnection(){bridgeToken='';try{sessionStorage.removeItem('wwreutr-bridge-session')}catch{}}
  connect.onclick=async()=>{if(bridgeToken){forgetConnection();enabled=false;cancel();toggle.disabled=true;toggle.textContent='자동 라디오 시작';toggle.setAttribute('aria-pressed','false');connect.textContent='유로트럭 연결 요청';region=null;showLock();label.textContent='PC 연결 해제 · 현재 방송은 계속 재생됩니다';return;}connect.disabled=true;connect.textContent='연결 진행 중…';label.textContent='PC 연결 프로그램을 확인하고 있습니다. 접근 권한 요청이 나오면 허용해 주세요.';
    try{const r=await fetch(bridgeURL+'/api/status',{targetAddressSpace:'loopback',signal:AbortSignal.timeout(8000)});if(!r.ok||(await r.json()).app!=='WWR-EUTR Bridge')throw Error('bridge');label.textContent='연결 승인 화면으로 이동합니다…';location.assign(bridgeURL+'/');}
    catch{label.textContent='연결할 수 없습니다. 아래 안내에서 WWR-EUTR 연결 프로그램을 실행하고 다시 요청하세요. 접근을 거부했다면 브라우저 사이트 설정에서 허용해 주세요.';box.querySelector('details').open=true;}
    finally{connect.disabled=false;connect.textContent='유로트럭 연결 요청';}};
  const label=box.querySelector('#etsRegion'),toggle=box.querySelector('#etsAuto'),next=box.querySelector('#etsNext'),lock=box.querySelector('#etsLock');
  let enabled=false,region=null,applied='',generation=0,candidates=[],index=-1,retryAt=0,attemptTimer;
  let locked=read('wwreutr-ets2-locked',false)===true;
  function showLock(){lock.setAttribute('aria-pressed',String(locked));lock.textContent=locked?'고정 해제':'라디오 고정';next.disabled=locked||!bridgeToken;}
  showLock();
  if(bridgeToken){toggle.disabled=false;connect.textContent="연결 해제";}
  const saved=read('wwreutr-ets2-preferred',{});
  const nativeTune=tune;
  tune=async function(station){if(enabled&&region&&station.countrycode===region.country){saved[region.country]=station.stationuuid;localStorage.setItem('wwreutr-ets2-preferred',JSON.stringify(saved));}return nativeTune(station);};
  function cancel(){generation++;clearTimeout(attemptTimer);}
  async function playCandidate(token){
    if(token!==generation||!enabled||locked)return;
    clearTimeout(attemptTimer);
    const s=candidates[++index];
    if(!s){label.textContent='재생 가능한 방송을 찾지 못했습니다 · 60초 후 재시도';applied='';retryAt=Date.now()+60000;return;}
    await nativeTune(s);
    if(token!==generation||!enabled||locked)return;
    attemptTimer=setTimeout(()=>{if(token===generation&&audio.readyState<3)void playCandidate(token)},22000);
  }
  async function switchRegion(r){
    if(locked||!enabled)return;
    cancel();const token=generation;applied=r.country;label.textContent=r.name+' · 방송국을 찾고 있습니다';
    try {
      const p=new URLSearchParams({countrycode:r.country,hidebroken:'true',is_https:'true',limit:'30',order:'clickcount',reverse:'true'});
      const data=uniqueStations(await api('stations/search?'+p));
      if(token!==generation||!enabled||locked)return;
      candidates=data.sort((a,b)=>Number(b.stationuuid===saved[r.country])-Number(a.stationuuid===saved[r.country]));index=-1;
      showFavorites=false;$('country').value=r.country;$('genre').value='';request++;stations=candidates;render();
      $('explore').classList.add('active');$('favorites').classList.remove('active');document.querySelector('.radio-float h1').textContent='WWR-EUTR';
      await playCandidate(token);
    } catch {if(token===generation){applied='';retryAt=Date.now()+30000;label.textContent='방송국 서버 연결 실패 · 30초 후 재시도';}}
  }
  toggle.onclick=()=>{enabled=!enabled;toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'자동 라디오 중지':'자동 라디오 시작';cancel();applied='';retryAt=0;if(!enabled)audio.pause();else if(region)void switchRegion(region);};
  lock.onclick=()=>{locked=!locked;try{localStorage.setItem('wwreutr-ets2-locked',JSON.stringify(locked))}catch{}cancel();showLock();if(locked){label.textContent='라디오 고정 · 국가가 바뀌어도 현재 방송 유지';}else{applied='';retryAt=0;if(enabled&&region)void switchRegion(region);}};
  next.onclick=()=>{if(enabled&&!locked&&candidates.length){clearTimeout(attemptTimer);void playCandidate(generation);}};
  audio.addEventListener('error',()=>{if(enabled&&!locked) {clearTimeout(attemptTimer);attemptTimer=setTimeout(()=>void playCandidate(generation),1200)}});
  audio.addEventListener('playing',()=>clearTimeout(attemptTimer));
  async function poll(){
    if(!bridgeToken){setTimeout(poll,1000);return;}
    const activeToken=bridgeToken;
    try{
      const response=await fetch(bridgeURL+'/api/telemetry',{targetAddressSpace:'loopback',headers:{Authorization:'Bearer '+activeToken},signal:AbortSignal.timeout(2500)});
      if(activeToken!==bridgeToken){setTimeout(poll,1000);return;}
      if(response.status===401){forgetConnection();enabled=false;cancel();toggle.disabled=true;toggle.textContent='자동 라디오 시작';toggle.setAttribute('aria-pressed','false');connect.textContent='다시 연결';showLock();throw Error('expired');}
      if(!response.ok)throw Error('bridge');const t=await response.json();
      region=t.connected&&!t.outOfRange?t.region:null;
      if(region)region={...region,country:region.country.split('-')[0]};
      if(t.paused&&t.game===1&&t.revision===12)label.textContent='게임 일시정지 · 운전 화면에서 잠시 주행해 주세요';
      else if(!t.connected)label.textContent='게임 위치 연결 대기 · 플러그인 설치 후 게임을 재시작하세요';
      else if(t.game!==1)label.textContent='유로트럭 2 실행을 기다립니다';
      else if(t.outOfRange)label.textContent='지원 좌표 범위 밖 · 현재 방송 유지';
      else if(t.paused)label.textContent='게임 일시정지 · 현재 방송 유지';
      else if(region){label.textContent=region.name+' · '+countryName(region.country)+(locked?' · 라디오 고정':enabled?' · 자동 전환 켜짐':' · 자동 전환 꺼짐');if(enabled&&!locked&&applied!==region.country&&Date.now()>=retryAt)void switchRegion(region);}
      else label.textContent='지역 확인 중 · 약 8초 기다려 주세요';
    }catch(error){if(activeToken===bridgeToken||error.message==='expired'){region=null;cancel();label.textContent=error.message==='expired'?'연결이 만료되었습니다 · 다시 연결해 주세요':'PC 연결 끊김 · 연결 프로그램을 확인하세요. 현재 방송은 유지합니다.';}}
    setTimeout(poll,1000);
  }
  void poll();
})();
