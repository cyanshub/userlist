const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users/"


// 選取要動態產生資料的容器
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")



// 準備一個變數來裝使用者資料
let users = []
let filteredUsers = []
let page = []
const USERS_PER_PAGE = 30 // 一頁顯示6張卡片、5列



// 設置觸發函式: 渲染網頁
function renderUserList (data){
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <!-- 製作 AVATAR 頭像 -->
      <div class="col-sm-2">
        <div class="mb-2">
          <div class="card text-center">
            <img src=${item.avatar} class="card-img-top btn-show-modal" alt="avatar-image" data-bs-toggle="modal" data-bs-target="#avatar-modal" data-id=${item.id}>
            <h10 class="card-title">${item.name}</h10>
           </div>
          
          <div class="card-footer text-center">
            <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>x</button>
          </div>          
                  
        </div>
      </div>
    `
  });

  dataPanel.innerHTML = rawHTML
}




// 設置觸發函式: 彈出視窗
function showUserModal(id){
  const modalTitle = document.querySelector('#user-modal-title')
  const modalAge = document.querySelector('#user-modal-age')
  const modalBirthday = document.querySelector('#user-modal-birthday')
  const modalGender = document.querySelector('#user-modal-gender')
  const modalUpdatedDate = document.querySelector('#user-modal-updated-at')

  // 利用 id 發送請求
  axios.get(INDEX_URL + id).then( response =>{
    // 簡化資料
    const data = response.data
    console.log(data)

    modalTitle.innerHTML = data.name + ' ' + data.surname
    modalAge.innerHTML = 'Age: ' + data.age
    modalBirthday.innerHTML = 'Birthday: ' + data.birthday
    modalGender.innerHTML = 'Gender: ' + data.gender
    modalUpdatedDate.innerHTML = 'Updated at: '+ data.updated_at
  })
  
}



// 設計函式: 控制每頁預計顯示的人數
function getUsersByPage(page){  
  // 判別是否有搜尋結果, 決定要有哪一份資料
  const data = filteredUsers.length ? filteredUsers: users
  
  // page = 1 -> users = 0 ~ 29
  // page = 2 -> users = 30 ~ 59
  const startIndex = (page-1) * USERS_PER_PAGE 
  const endIndex = startIndex + USERS_PER_PAGE
  
  return data.slice(startIndex, endIndex)
}



// 設計函式: 依使用者數量, 動態顯示正確的頁數
function renderPaginator(amount){
  // users = 26, page = 1: 26/30 ... 4 page = 0 + 1
  // users = 31, page = 2: 1 ... 1  page = 1 + 1
  // page = users / 30 +
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  console.log(numberOfPages)

  let rawHTML = ''

  for (let i = 1; i <= numberOfPages; i++)
  rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page=${i}>${i}</a></li>
  `
  paginator.innerHTML = rawHTML
}



// 設計觸發函式: 執行收藏功能
function addToFavorite(id){
  // 宣告收藏使用者變數, 並從瀏覽器暫存提取資料
  const list = JSON.parse(localStorage.getItem('favoriteUsers')  ) || []
  
  // 使用 find 陣列方法挑選使用者並裝取資料
  const user = users.find( user => user.id === id )
  
  // 使用 some 陣列檢查裝取的資料是否已經存在, 若有則停止函式
  if(list.some( user => user.id === id )){
    return alert("此使用者已在收藏清單中!")
  } 
  
  // 裝入資料
  list.push(user)

  // 將資料存回瀏覽器中
  localStorage.setItem('favoriteUsers', JSON.stringify(list))

}



// 設計觸發函式: 執行移除功能
function removeFromFavorite(id){
  // 檢查使用者清單, 判斷是否要執行移除功能
  if( users.length === 0 ) return

  // 使用 findIndex 方法, 刪除選到的卡片
  const userIndex = users.findIndex( user => user.id === id )
  users.splice(userIndex, 1) // 刪除位置, 刪除數目


  // 將修改完的資料存回瀏覽器
  localStorage.setItem('favoriteUsers', JSON.stringify(users))


  // 依刪除結果重新選染網頁
  renderUserList(getUsersByPage(page)) // 渲染網頁: 控制顯示的人數, page 宣告在外面以停留在刪除頁面
  renderPaginator(users.length)  // 依收藏人數制定動態顯示正確頁數

} 




// 設置監聽器: 監聽點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  console.log(event.target)
  // 觸發彈出視窗
  if (event.target.matches('.btn-show-modal')) {
    showUserModal(Number(event.target.dataset.id))
  }

  // 沿用監聽器: 監聽點擊收藏按鈕
  else if( event.target.matches('.btn-add-favorite')){
    console.log(Number(event.target.dataset.id))
    addToFavorite(Number(event.target.dataset.id))
  }

  // 沿用監聽器: 監聽點擊移除按鈕
  else if( event.target.matches('.btn-remove-favorite')){
    console.log(Number(event.target.dataset.id))
    removeFromFavorite(Number(event.target.dataset.id))
  }
})



// 設置監聽器: 擷取點選的頁碼訊息
paginator.addEventListener('click', function onPaginatorClicked(event){
  // 檢查點擊的元素是否為頁碼, 適才繼續往下
  if(event.target.tagName !== 'A'){
    return
  }
  
  page = Number (event.target.dataset.page)
  console.log(page)

  // 依點擊的頁碼, 渲染成對應的頁面
  renderUserList(getUsersByPage(page))

})



// 設置監聽器: 綁定 submit 事件, 並設計要觸發的函式
searchForm.addEventListener("submit", function onSearchFormSubmitted(event){
  event.preventDefault()
  
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)

  // 設計提醒視窗
  if(!keyword.length){
    filteredUsers = [] // 清空搜尋
    renderUserList(getUsersByPage(page=1)) // 重置頁面
    renderPaginator(users.length) // 重置頁面
    return alert('Please enter a valid string')
  }



  // 使用 filter 陣列方法
  filteredUsers = users.filter(user => user.name.toLowerCase().includes(keyword))
  console.log(filteredUsers)



  // 設計互動式提醒訊息
  if (filteredUsers.length === 0) {
    return alert("Cannot find a user with the keyword: " + keyword)
  }

  // 依搜尋結果, 重新渲染網頁
  renderUserList(filteredUsers)
  renderUserList(getUsersByPage(page = 1)) // 依搜尋結果渲染網頁, 預設顯示第一頁
  renderPaginator(filteredUsers.length) // 依搜尋結果動態顯示正確的網頁頁數


})



// 串接 WEB-API 取得伺服器資料
// axios.get(INDEX_URL).then(response => {
//   // console.log(response)

//   // 利用 push() 與展開運算子 裝入資料ˇ
//   users.push(... response.data.results )
//   console.log(users)
  
//   renderUserList(users)
//   renderUserList(getUsersByPage(page =1 )) // 控制顯示的人數, 預設顯示第一頁


//   // 依使用者人數, 動態顯示正確頁數
//   renderPaginator(users.length)

// })

// .catch((err) => console.log(err))



// 直接從 localStorage 讀取資料
users = JSON.parse(localStorage.getItem('favoriteUsers')) || []
renderUserList(users) // 渲染網頁
renderUserList(getUsersByPage(page = 1)) // 渲染網頁: 控制顯示的人數, 預設顯示第一頁
renderPaginator(users.length)  // 依收藏人數制定動態顯示正確頁數