$(document).ready(function(){
	var isClicked = 0;

	function isEmpty(msisdn) {
		return msisdn === "" || msisdn === null;
	}

	function isValidMsisdn(msisdn){
		return /^(0811[0-9]{6,8}|62811[0-9]{6,8}|0812[0-9]{7,8}|62812[0-9]{7,8}|0813[0-9]{7,8}|62813[0-9]{7,8}|0851[0-9]{7,8}|62851[0-9]{7,8}|0852[0-9]{7,8}|62852[0-9]{7,8}|0853[0-9]{7,8}|62853[0-9]{7,8}|0821[0-9]{7,8}|62821[0-9]{7,8}|0822[0-9]{7,8}|62822[0-9]{7,8}|0823[0-9]{7,8}|62823[0-9]{7,8})$/.test(msisdn);
	}
	
	function normalizeMsisdn(msisdn){
		var result = msisdn;
		if(msisdn.startsWith('0'))	{
			result = '62' + result.substr(1, result.length - 1);
		}		
		return result;
	}
	
	function requestOTP(msisdn, cpToken){
		if(!isEmpty(msisdn)){
			if(isValidMsisdn(msisdn)){
				msisdn = normalizeMsisdn(msisdn);
				var lastToken = localStorage.getItem(msisdn);
				console.log(lastToken);
				var currentTime = new Date().getTime()
				if(!lastToken || (lastToken && Math.abs(lastToken - currentTime) / 1000 > 60)){
					$.post(URL_API_OTP_WEBOPTIN + 'https://auth2.telkomsel.com/transaksi/subsciberTokenNew?',
						{
							'msisdn': msisdn,
							'cp_token': cpToken
						},
						function(data){
							console.log(data)
							var obj = JSON.parse(data);
							console.log(obj.response);
							if(obj.response == RESPONSE_OTP_SUCCESS){
								notification(NOTIFICATION_SUCCESS, '.notification', 'Kode verifikasi telah dikirimkan ke nomor ' + msisdn);
							}else if(obj.response == RESPONSE_OTP_FAILED){
								notification(NOTIFICATION_DANGER, '.notification', 'Sistem sedang sibuk, Silakan coba beberapa saat lagi');
							}else if(obj.response == RESPONSE_OTP_CP_TOKEN_NOT_EXIST){
								notification(NOTIFICATION_DANGER, '.notification', 'Halaman ini sudah expired');
							}else if(obj.response == RESPONSE_OTP_NOT_ALLOWED){
								notification(NOTIFICATION_DANGER, '.notification', 'Halaman ini tidak memiliki hak akses kode verifikasi');
							}else if(obj.response == RESPONSE_OTP_MSISDN_NOT_VALID){
								notification(NOTIFICATION_DANGER, '.notification', 'Nomor yang anda masukkan salah');
							}else if(obj.response == RESPONSE_OTP_PARAMETER_NOT_VALID){
								notification(NOTIFICATION_DANGER, '.notification', 'Parameter tidak valid');
							}
						}
					);
					localStorage.setItem(msisdn, currentTime);
					isClicked++;
					if(isClicked > 0){
						$('#token-button').addClass('btn-is-disabled');
						$('.resend-button').removeClass('btn-is-disabled');
					}
				}else{
					notification(NOTIFICATION_DANGER, '.notification', 'Permintaan kode verifikasi hanya bisa digunakan 60 detik sekali');
				}
			}else{
				notification(NOTIFICATION_DANGER, '.notification', 'Nomor yang anda masukkan salah');
			}
		}else{
			notification(NOTIFICATION_DANGER, '.notification', 'Masukkan nomor ponsel Anda');
		}
	}
	
	if($('input[name=msisdn]').val()){
		var msisdn = $('input[name=msisdn]').val(),
		    cpToken = $('input[name=cp_token]').val();
			
		requestOTP(msisdn, cpToken);
	}
	
	$('.token-button').click(function(){
		var msisdn = $('input[name=msisdn]').val(),
		    cpToken = $('input[name=cp_token]').val();
			
		requestOTP(msisdn, cpToken);
	});
	
	$('.back-button').click(function(){
		window.history.previous();
	});

	$('#submit-button').click(function(event){
		var msisdn = $('input[name=msisdn]').val(),
		    token = $('input[name=token]').val(),
		    cpToken = $('input[name=cp_token]').val();
	
		if(!isEmpty(msisdn)){
			if(isValidMsisdn(msisdn)){
				if(!isEmpty(token)){
					$('#frmp').submit();
				}else{
					notification(NOTIFICATION_DANGER, '.notification', 'Masukkan kode verifikasi Anda');
				}
			}else{
				notification(NOTIFICATION_DANGER, '.notification', 'Nomor yang anda masukkan salah');
			}		
		}else{
			notification(NOTIFICATION_DANGER, '.notification', 'Masukkan nomor ponsel Anda');
		}
	});

});
