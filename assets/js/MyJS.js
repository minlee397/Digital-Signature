
$( document ).ready(function() {	
	$('[data-toggle="tooltip"]').tooltip();   

	$('.loading').hide();
	$("#_menu_sign").css("display","none");
    $("#_menu_generation_key").css("display","block");
    $("#_menu_verify").css("display","none");


  	
	$("#menu_sign").on('click', function() {
		$("#_menu_generation_key").css("display","none");
    	$("#_menu_sign").css("display","block");
    	$("#_menu_verify").css("display","none");
	});

  	$("#menu_verify").on('click', function() {
  		$("#_menu_generation_key").css("display","none");
    	$("#_menu_sign").css("display","none");
    	$("#_menu_verify").css("display","block");
    	
	});
	
	$("#menu_generation_key").on('click', function() {
  		$("#_menu_generation_key").css("display","block");
    	$("#_menu_sign").css("display","none");
    	$("#_menu_verify").css("display","none");
    	
	});



	//copy public va private

	function deselectAll() {
	  var element = document.activeElement;
	  
	  if (element && /INPUT|TEXTAREA/i.test(element.tagName)) {
	    if ('selectionStart' in element) {
	      element.selectionEnd = element.selectionStart;
	    }
	    element.blur();
	  }

	  if (window.getSelection) { // All browsers, except IE <=8
	    window.getSelection().removeAllRanges();
	  } else if (document.selection) { // IE <=8
	    document.selection.empty();
	  }
	}

	function copy_String(string_copy){
		var copyText = $("#"+string_copy);
		copyText.select();
		document.execCommand("copy");	
		deselectAll();	
		alert("Đã sao chép!");
	}

	$("#copy_public_key").on('click', function() {
  		copy_String("pub_key");
	});

	$("#copy_private_key").on('click', function() {
  		copy_String("prv_key");
	});

	$("#copy_signature").on('click', function() {
  		copy_String("signature_file");
	});

	$("#copy_hash_file").on('click', function() {
  		copy_String("hash_file");
	});
	
	// download file txt pub and prv
	function download(filename, text) {
	  var element = document.createElement('a');
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', filename);

	  element.style.display = 'none';
	  document.body.appendChild(element);

	  element.click();

	  document.body.removeChild(element);
	}

	$("#save_pub_key").on('click', function() {
		var text = $("#pub_key").val();
  		download("public_key.txt",text);
	});

	$("#save_prv_key").on('click', function() {
		var text = $("#prv_key").val();
  		download("private.txt",text);
	});



 	
	// thuc hien tao khoa
	function DoGenerationKey(){
		var len_rsa = $('#list_len_rsa').val();
		var type_pub = $('#list_type_pub').val();
		if(len_rsa == 0 || type_pub == 0)
			alert("Bạn chưa chọn kích thước của thuật toán RSA!!!");
		else
		{	
			if(type_pub == 2){
				keypair = KEYUTIL.generateKeypair("RSA", 2048);
	 			var tbs = new KJUR.asn1.x509.TBSCertificate(); 					
				tbs.setSerialNumberByParam({'int': 4});
				tbs.setSignatureAlgByParam({'name': 'SHA1withRSA'});
				tbs.setIssuerByParam({'str': '/C=US/O=a'});
				tbs.setNotBeforeByParam({'str': '130504235959Z'});
				tbs.setNotAfterByParam({'str': '140504235959Z'});
				tbs.setSubjectByParam({'str': '/C=US/CN=b'});
				tbs.setSubjectPublicKey(keypair.pubKeyObj); 
				tbs.appendExtension(new KJUR.asn1.x509.BasicConstraints({'cA':true}));
				tbs.appendExtension(new KJUR.asn1.x509.KeyUsage({'bin':'11'}));
				var cert = new KJUR.asn1.x509.Certificate({'tbscertobj': tbs, 'prvkeyobj': keypair.prvKeyObj});			
				cert.sign();
				var public_key = cert.getPEMString();
			}
			else
			{
				public_key = KEYUTIL.getPEM(keypair.pubKeyObj);
			}
			private_key = KEYUTIL.getPEM(keypair.prvKeyObj, "PKCS1PRV");
			
			$('#pub_key').val(public_key);
			$('#prv_key').val(private_key);
	
		}
	}


	$("#execute_generation_key").on('click', function() {
		$('#message_value').text("Đang khởi tạo key...");
		$('.loading').fadeIn("slow");
		setTimeout(function() {	       
	        DoGenerationKey();    	
  			$('.loading').hide();
  			$('#message_value').text("Tạo key hoàn thành");
	    }, 3000);
  		
	});



	// thuc hien ky tai lieu

	function displayContentFile(text,pdf,img,video,other){
		$('#box_text').css("display",text);
		$('#box_img').css("display",pdf);
		$('#box_pdf').css("display",img);
		$('#box_video').css("display",video);
		$('#box_other_file').css("display",other);
	}

	$("#open_doc").on('click', function() {
    	$("#fileInput").click();
	});

	$('#fileInput').change(function(e){
		var pdf = $('#fileInput');
		var file = $('#fileInput')[0].files[0];
		var filename = file.name;
		$('#name_file').val(filename);		
		var reader = new FileReader();	    	    
	    	if(isText(filename)){
	    		displayContentFile("block","none","none","none","none");
	    		reader.addEventListener('load', function (e) {
			      $('#content_file').text(e.target.result); 
			    });

			    reader.readAsText(file);
	    	}
	    	else if(isImages(filename)){
	    		displayContentFile("none","block","none","none","none");
	    		reader.addEventListener("load", function () {
				   $('#img_file').attr("src",reader.result); 
				});

				reader.readAsDataURL(file);
	    	}
	    	else if(isPdf(filename)){
	    		displayContentFile("none","none","block","none","none");
	    		tmppath = URL.createObjectURL(file);
	    		$("#pdf-show").attr("src",tmppath);
				
	    	}
	    	else if(isVideo(filename)){
	    		displayContentFile("none","none","none","block","none");
	    		tmppath = URL.createObjectURL(file);
	    		$("#video").html('<source src="'+tmppath+'" type="video/mp4"></source>');
				
	    	}
	    	else
	    	{
	    		displayContentFile("none","none","none","none","block");
	    	}
	     
	});

	function getExtension(filename) {
	    var parts = filename.split('.');
	    return parts[parts.length - 1];
	}

	function isText(filename) {
	    var ext = getExtension(filename);
	    switch (ext.toLowerCase()) {
	    case 'txt':		    
	        //etc
	        return true;
	    }
	    return false;
	}
	function isImages(filename) {
	    var ext = getExtension(filename);
	    switch (ext.toLowerCase()) {
	    case 'png':
	    case 'jpg':	
	    case 'gif':	   
	        //etc
	        return true;
	    }
	    return false;
	}

	function isPdf(filename) {
	    var ext = getExtension(filename);
	    switch (ext.toLowerCase()) {
	    case 'pdf':	       
	        //etc
	        return true;
	    }
	    return false;
	}

	function isVideo(filename) {
	    var ext = getExtension(filename);
	    switch (ext.toLowerCase()) {
	    case 'mp4':
	    case 'avi':	 
	    case 'avi':
	    case 'flv':
	    case 'mov':
	    case 'wmv':
	        //etc
	        return true;
	    }
	    return false;
	}

	function HashFile(){
		var file = $('#fileInput')[0].files[0];
		var reader = new FileReader();
		var hash_alg = $('#list_hash').val();
		var hash_string;
		if(file)
	    {
			reader.addEventListener("load", function () {
			   var binary = reader.result;
			   if(hash_alg == 'MD5')
			   	hash_string = CryptoJS.MD5(binary).toString();
			   else if(hash_alg == 'SHA256')
			   	hash_string = CryptoJS.SHA256(binary).toString();
			   else if(hash_alg == 'SHA512')
			   	hash_string = CryptoJS.SHA512(binary).toString();
			   else
			   	alert("Bạn chưa chọn thuật toán để hash file!!!");
			   $('#hash_file').val(hash_string);
			});

			reader.readAsBinaryString(file);
		}
	    else
	    	alert('Bạn chưa chọn tệp file!!!');
	}

	$('#btn_hash_file').on('click',function(){		
		HashFile();		 
	});


	function DoSign(){
		var rsa = new RSAKey();
		rsa.readPrivateKeyFromPEMString($('#signature').val());
		var alg_hash = $('#list_hash_sign').val();
		var message_hash = $('#hash_file').val();

		var hSig = rsa.signWithMessageHash(message_hash, alg_hash);
  		$('#signature_file').val(linebrk(hSig, 64));
	}

	$('#btn_sign_hash_file').on('click',function(){
		$('#message_value_sign').text("Đang ký...");
		$('.loading').fadeIn("slow");
		setTimeout(function() {	       
	        DoSign();   	
  			$('.loading').hide();
  			$('#message_value_sign').text("Chữ ký hoàn thành");
	    }, 3000);
	});


	// Thuc hien xac thuc tai lieu
	function DoVerify(){
		var message_hash = $('#hash_file_verify').val();
		var signverified = $('#signatured_string').val();
		var pubkey_verify = $('#pubkey_verify').val();

		var rsa_verify = KEYUTIL.getKey(pubkey_verify);		
		var isValid = rsa_verify.verifyWithMessageHash(message_hash,signverified);

		if(isValid)
		{
			$('#message_value_verify').text("Kết quả: Xác thực thành công ==> Tài liệu đúng");
			$('#message_value_verify').addClass("message_value_verify_right");
		}
		else
		{
			$('#message_value_verify').text("Kết quả: Xác thực không thành công ==> Tài liệu đã bị giả mạo");
			$('#message_value_verify').addClass("message_value_verify_wrong");
		}
	}

	$('#btn_verify_hash_file').on('click',function(){
		$('#message_value_verify').css("color","#000");
		$('#message_value_verify').text("Đang xác thực...");
		$('.loading').fadeIn("slow");
		setTimeout(function() {	       
	        DoVerify();   	
  			$('.loading').hide();  			
	    }, 3000);
	});
});
