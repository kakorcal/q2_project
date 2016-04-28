$(()=>{

  // FLASH MESSAGE

  var $flash = $('#flash-message');
  var $container = $('#flash-container');
  if($flash.text()){
    console.log($flash.length);
    $container.show();
  }

  switch($flash.text().length){
    case 17: 
      $container.addClass('alert-success');
      $flash.addClass('flash animated');
      console.log('login success and profile is updated');
      break;
    case 77:
      $container.addClass('alert-danger');
      $flash.addClass('flash animated');
      console.log('login success');
      break;
    case 33:
      $container.addClass('alert-success');
      $flash.addClass('flash animated');
      console.log('logout success');
      break;
    case 41:
      $container.addClass('alert-warning');
      $flash.addClass('flash animated');
      console.log('not logged in');
      break;
    case 46: 
      $container.addClass('alert-danger');
      $flash.addClass('flash animated');
      console.log('not correct user');
      break;
    case 69:
      $container.addClass('alert-danger');
      $flash.addClass('flash animated');
      console.log('cannot access thread if not participant');
      break;
    case 42:
      $container.addClass('alert-danger');
      $flash.addClass('flash animated');
      console.log('account deleted');
      break;
  }

  var currentUserID = $('#current-user-id').text();

  $('#update').on('click', update);
  $('#search').on('click', search);
  $('#profileSearch').on('click', profileSearch);

  function update(e)
  {
    e.preventDefault();
    var inputLocation = $('#locationInput').val();
    function updateCallback(location){

      
    var gender =  $("input[type='radio'][name=genderInput]:checked").val(),
        description = $("#descriptionInput").val(),
        age = ($("#ageInput").val() ? $("#ageInput").val() : undefined),
        img_url = $("#imgInput").val(),
        user = {user: {location, gender, age, img_url, description}}
        
        $.ajax({
          type: "PUT",
          url: '/users/'+currentUserID,
          data: user,
          success: (data)=>{
            //REBUILD USER PROFILE INFORMATION 
            $("#profileAge").text(data.age);
            $("#profileDescription").text(data.description);
            $("#profileLocation").text(data.location);
            $("#profileEmail").text(data.email);
            $("#profileGender").text('Gender: '+data.gender+" ");
            $("#profileAge").text('Age: '+data.age)

            //window.location.pathname = data;
          }
        });
    }

    formatLocation(inputLocation, updateCallback);
  }

  function profileSearch(e)
  {
    e.preventDefault();
    $.get('/users',
          null,
          function(data)
          {
            $('#locationInput').val(data.location);
            
            search(null, data.languages);
          }, 
          'json');
  }

  function formatLocation(inputLocation, cb)
  {
    var geoCoder = new google.maps.Geocoder();
    geoCoder.geocode({address: inputLocation}, 
    (results, status)=>
    {
      if(status == google.maps.GeocoderStatus.OK)
      {
        cb(results[0].formatted_address);
      }
      else 
       { 
         alert("Geocode was not successful for the following reason: " + status);
       }

    })
  }

  function search(e, languagesArr)
  {
    if(e){e.preventDefault();}
    var inputLocation = $('#locationInput').val();
    formatLocation(inputLocation, searchCallback);

    function searchCallback(location){
      var language = languagesArr || [$('#languageInput').val()];

      var searchData = {location, language};

      $.get( "/users", searchData,
        function(usersData){
          debugger;
          $('#users-list').empty();
          var languageArray = $.map(buildLanguageObj(usersData), cur => [cur])
               .forEach(user => {
                  buildUserList(user);
              });                
        }, 
        'json');
    }
  }

  function buildLanguageObj(usersData)
  {   
    // Build skeleton obj - adding learning and teaching arrays
    var current = currentUserID ? currentUserID : -1;
    var languageObj = usersData.filter(cur => cur.user_id !== +current)
      .reduce(function(acc, cur){
        if(!acc[cur.name]){
          acc[cur.name] = {
            id: cur.user_id,
            name: cur.name, 
            img_url: cur.img_url,
            gender: cur.gender,
            age: cur.age,
            location: cur.location,
            updated_at: cur.updated_at,
            description: cur.description,
            learning: [], 
            teaching: []
          }
        }
        return acc;
      }, {});

      // Push language and proficiency objects to the learning and teaching arrays
      usersData.forEach(function(cur){
        //if(languageObj[cur.name]){ --THINK THIS MAY ALWAYS EVALUATE TO TRUE
          if(cur.approach === 'Learning'){
            languageObj[cur.name].learning.push({lang: cur.language, prof: cur.proficiency});
          }
          if(cur.approach === 'Teaching'){
            languageObj[cur.name].teaching.push({lang: cur.language, prof: cur.proficiency});
          }
       // }
      });

      return languageObj;
  }

  function buildUserList(user)
  {
    var usersList = $('#users-list');
    var panel = $('<div class="panel"></div>');
    var panelBody = $('<div class="panel-body"></div>');
    var profileHead = $('<div class="profile-head"></div>');
    var profileDesc = $('<div class="profile-desc"></div>');
    var thumbnail = $('<img src="'+user.img_url+'" alt="profile" />');
    var username = $('<h2></h2>').text(user.name+' ');
    var gender = $('<span></span>').text('Gender: '+user.gender.charAt(0).toUpperCase() + user.gender.slice(1)+'  ');
    var age = $('<span></span>').text('Age: '+user.age);
    var teaching = $('<h4></h4>').text('Teaching Languages: ');
    var teachingContainer = $('<div class="teaching-languages"></div>');
    var learning = $('<h4></h4>').text('Learning Languages: ');
    var learningContainer = $('<div class="learning-languages"></div>');
    var descWrap = $('<h4></h4>').text('Description:');
    var desc = $('<p></p>').text(user.description);
    var location = $('<h4></h4>').text('Location: '+user.location);
    var lastLogin = $('<h4></h4>').text('Last Login: '+user.updated_at);
    var form = $('<form/>');
        form.attr("action", "/threads");
        form.attr("method", "POST");

    buildForm(user.id, form);
    buildUserStars(user.learning, learningContainer);
    buildUserStars(user.teaching, teachingContainer);

    usersList.append(
      panel.append(
        panelBody.append(
          profileHead.append(
            thumbnail, 
            username.append(
              gender, age
            )
          ),
          profileDesc.append(
            '<hr>',
            learning,
            learningContainer,
            '<hr>',
            teaching,
            teachingContainer,
            '<hr>',
            descWrap,
            desc,
            '<hr>',
            location,
            '<hr>',
            lastLogin
          ),
          '<hr>',
          form
        )
      )
    );

  }

  function buildForm(id, form)
  {
    var threadGroup = $('<div class="form-group"></div>');
    var threadLabel = $('<p></p>').text('Subject: ');
    var thread = $('<input class="form-control" type="text" name="thread[subject]">');
    var messageGroup = $('<div class="form-group"></div>');
    var messageLabel = $('<p></p>').text('Message: ');
    var message = $('<textarea class="form-control" type = "text" name = "message[message]"></textarea>');
    var senderId = $('<input type = "hidden" name = "message[sender_id]" value ='+currentUserID+'>');
    var recId = $('<input type = "hidden" name = "message[rec_id]" value = '+id+'>');
    var btnGroup = $('<div class="form-group text-center"></div>');
    var sendBtn = $('<input type = "submit" class = "btn btn-info" value = "SEND MESSAGE">');

    form.append(
      threadGroup.append(
        threadLabel,
        thread
      ),
      messageGroup.append(
        messageLabel,
        message
      ),
      senderId,
      recId,
      btnGroup.append(sendBtn)
    );
  }

  function buildUserStars(prop, container)
  {
    if(prop.length !== 0){
      prop.forEach(cur => {
        var languageEntry = $('<p></p>');
        var language = $('<span></span>').text(cur.lang + ' : ');
        var stars = $('<span class="stars"></span>');
        for(var i = 0; i < 5; i++){
          var star = $('<i class="fa" aria-hidden="true">');
          if(cur.prof > i){
            star.addClass('fa-star');
          }else{
            star.addClass('fa-star-o');
          }
          stars.append(star);
        }
        container.append('<hr>',
          languageEntry.append(
            language, stars
          )
        );
      });          
    }
  }
});