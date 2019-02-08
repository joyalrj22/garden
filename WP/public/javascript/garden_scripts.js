var loggedin = false;
var adminStatus = "none";
var username;

function getDiaryEntries(){
	$.get('/diary',{},
	function(data){
		$(".diary").empty();
		var template = $("#diary-template").html();
		var diaryData = {"date":"dd/mm/yyyy","title":"a","entry":"b"};
		for ( var key in data){
			diaryData.date = key;
			for (var Title in data[key]){
				diaryData.title = Title;
				diaryData.entry = data[key][Title];
				var html = Mustache.to_html(template, diaryData);
				$(".diary").append(html);
			
			}
		}
	});
	if (typeof sessionStorage.access_token !== "undefined"){
		$("#addDEntry").show();
	}
	
}

function photos(){
	$.get('/photos',{},
	function(data){
		$(".tz").empty();
		var template = $("#photo-template").html();
		var photoData = {path:""};
		for (i in data.paths){
			photoData.path = data.paths[i];
			var html = Mustache.to_html(template, photoData);
			$("#pictureHolder").append(html);
		}
		
	});
}

function events() {
	$.get('/events',{},
	function(data){
		$(".events").empty();
		monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
		"Jul","Aug","Sep","Oct","Nov","Dec"];
		var template = $("#events-template").html();
		var eventData = {"date":"yyyy-mm-dd","day":"dd","month":"mm","year":"yyyy",
		"title":"a","desc":"b"}
		for (var key in data){
			eventData.date = key;
			temp = key.split("-");
			eventData.day = temp[2];
			eventData.month = monthNames[parseInt(temp[1],10)-1];
			eventData.year = temp[0];
			for (var Title in data[key]){
				eventData.title = Title;
				eventData.desc = data[key][Title];
				var html = Mustache.to_html(template, eventData);
				$(".events").append(html);
			}
		}
	});
	if (typeof sessionStorage.access_token !== "undefined"){
		$("#addEEntry").show();
	}
}
		
function getComments() {
	$.get('/comments',{},
	function (data) {
		$(".media-list").empty();
		var template = $("#comment-template").html();
		for (var key in data[0]) {
			var commentData = {};
			commentData.date = key;
			for (var user in data[0][key]) {
				commentData.name = user;
				for (j in data[0][key][user]){
					commentData.comment = data[0][key][user][j];
					for (i in data[1]){
						if (data[1][i].username == commentData.name){
							commentData.pp = data[1][i].dp;
						}
					}
					var html = Mustache.to_html(template, commentData);
					$(".media-list").append(html);
					
				}
				
				
			}
			
		}
		
		$(".content").hide();
		$("#blogContent").show();
		if (loggedin == false){
			$("#addComment").hide();
			$("#submitComment").hide();
		}
		
		
		
	});
}

function blog(){
	
	getDiaryEntries();
	getComments();
	}
	
$("div.content").not(":eq(0)").hide();
$("#logout").hide();
$(".addEntry").hide();

function changeTab(event){
	event.preventDefault();
	$(".content").hide();     
	$(event.data.pageID).show();
	if (event.data.pageID == "#eventsContent"){
		events();
	} else if (event.data.pageID == "#photoContent"){
		photos();
	}
}


$(document).ready(function(){
	var prevScrollpos = window.pageYOffset;
	window.onscroll = function() {
	var currentScrollPos = window.pageYOffset;
	if (prevScrollpos > currentScrollPos) {
		$(".navbar").css({top:"0"});
	} else {
		$(".navbar").css({top:"-50px"});
	}
	  prevScrollpos = currentScrollPos;
	}
	$("#blog").on("click",{},blog);
	$("#events").on("click",{pageID:"#eventsContent"},changeTab);
	$("#photo").on("click",{pageID:"#photoContent"},changeTab);
	$("#about").on("click",{pageID:"#aboutContent"},changeTab);
	$(".navbar-brand").on("click",{pageID:"#homeContent"},changeTab);
	
	$("#openLogin").click(function(){
		$("#myModal").modal();
		
	});
	
	$("#addDEntry").click(function(){
		$("#diaryModal").modal();
		
	});
	
	$("#addEEntry").click(function(){
		$("#eventModal").modal();
		
	});
	
	$("#logout").on("click", function(){ 
		sessionStorage.setItem("access_token","undefined");
		if ($("#blogContent").is(':visible')){
			$("#addComment").hide();
			$("#submitComment").hide();
		}
		$("#logout").hide();
		$(".addEntry").hide();
		$("#openLogin").show();
	});

	
	$("#logSub").on("click", function() {
			username = $('#usrname').val();
			$.ajax({
				method: "POST",
				url: '/login',
				data: {formData:$("#logForm").serialize()},
				success: function(data,status){
					$("#closeModal").click();
					
					sessionStorage.setItem("access_token", data);
					loggedin = true;
					if ($("#blogContent").is(':visible')){
						$("#addComment").show();
						$("#submitComment").show();
						$("#addDEntry").show();
						
					}else if ($("#eventsContent").is(':visible')){
						$("#addEEntry").show();
					}
					$("#openLogin").hide();
					$("#logout").show();

				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
							alert("Invalid Credentials, please try again");
						}
			});
			
			
			
	});
	
	$("#diarySub").on("click", function(){
		
		$.ajax({
			method: "POST",
			url: '/addDiary',
			data: {formData: $("#diaryForm").serialize()},
			success: function(data, status) {
				$("#closeDEntry").click();
				blog();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("Invalid Diary Entry. Please try again");
			}
		});
	});
	
	$("#eventSub").on("click", function(){
		
		$.ajax({
			method: "POST",
			url: '/addEvent',
			data: {formData: $("#eventsForm").serialize()},
			success: function(data, status) {
				$("#closeEEntry").click();
				events();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("There is an error with the server. Please try again.");
			}
		});
	});
	
	$("#submitComment").on("click", function() {
			
			var comment = $('#addComment').val();
			
			
			$.ajax({
				method: "POST",
				url: '/addComment',
				data: {[username]:comment, "access_token": sessionStorage.access_token},
				success: blog(),
				error: function(XMLHttpRequest, textStatus, errorThrown) {
							
						}
			});
			
			
		
	});
	
	

	// logout : sessionStorage.setItem("access_token","");
});
$(window).load(function() {
	sessionStorage.clear();
	$('.event-details').css('display','none');
	$('.event-details').css('height','auto');
	$('.event-details').css('margin-top','-17px');
	$('.event-details > .info').css('height','auto');
	$('.disabled').prev().css('cursor','default');
	
	
	$('.event-list > li').click(function() {
		if (!$(this).nextAll('.event-details').first().hasClass('disabled')) {
			
			$(this).nextAll('.event-details').first().nextAll('.info').first().height('auto');
			$(this).nextAll('.event-details').first().slideToggle();
		}
		});
});