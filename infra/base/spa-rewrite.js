// SPA 새로고침 대응 (nginx try_files 역할): 확장자 없는 경로는 각 앱의 index.html로
function handler(event) {
  var req = event.request;
  if (req.uri.split('/').pop().indexOf('.') === -1) {
    req.uri = req.uri.indexOf('/owner') === 0 ? '/owner/index.html' : '/index.html';
  }
  return req;
}
