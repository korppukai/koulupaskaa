// ==UserScript==
// @name			POP
// @namespace		http://fer
// @include			https://www2.poppankki.fi/YritysVerkkopalvelutWeb/*
// @include			https://www4.poppankki.fi/pankki/maksut/uusi*
// @include			https://www4.poppankki.fi/pankki/maksut/*
// @include			https://ebank.www.poppankki.fi/YritysVerkkopalvelutWeb/*
// @include			https://ebank.poppankki.fi/netbank/*
// @description		Bank script for POP
// @grant			GM_xmlhttpRequest
// ==/UserScript==

(function()
{
	function refresh_page()
	{
		var t = setTimeout("location.reload(true)", 60000);
	}

	function acc2bank(acc)
	{
		if(acc.substring(0,1) == '1' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '1')) return 'Nordea';
		if(acc.substring(0,1) == '2' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '2')) return 'Nordea';
		if(acc.substring(0,1) == '4' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '4')) return 'Sp / Pop / Aktia';
		if(acc.substring(0,1) == '5' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '5')) return 'Osuuspankki';
		if(acc.substring(0,1) == '6' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '6')) return 'Ålandsbanken';
		if(acc.substring(0,1) == '8' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,5) == '8')) return 'Sampo';
		if(acc.substring(0,2) == '31' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '31')) return 'Handelsbanken';
		if(acc.substring(0,2) == '32' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '32')) return 'Mandatum (kaikki)';
		if(acc.substring(0,2) == '33' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '33')) return 'Skandinaviska Enskilda Banke (kaikki)';
		if(acc.substring(0,2) == '34' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '34')) return 'Danske Bank (kaikki)';
		if(acc.substring(0,2) == '36' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '36')) return 'Tapiola (kaikki)';
		if(acc.substring(0,2) == '37' || ((acc.substring(0,2) == 'FI' || acc.substring(0,2) == 'fi') && acc.substring(4,6) == '37')) return 'DnB NOR Bank ASA (kaikki)';
	}

	function normal_pay()
	{
		var idz = document.getElementsByTagName('input')[0].value;
		if(idz.length<2)
		{
			return false;
		}
		GM_xmlhttpRequest(
		{
			method: 'GET',
			url: 'https://intra1.ferratum.com/ferra/applications/xmlbank.php?id='+idz,
			headers:
			{
				'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/0.3',
				'Accept': 'application/atom+xml,application/xml,text/xml'
			},
			onload: function(responseDetails)
			{
				var parser = new DOMParser();
				var dom = parser.parseFromString(responseDetails.responseText, "application/xml");
				paid = dom.getElementsByTagName('paid')[0].textContent;
				approved = dom.getElementsByTagName('approved')[0].textContent;
				bank = dom.getElementsByTagName('bank_account')[0].textContent;
				if(((bank.substring(0, 2) == 'FI' || bank.substring(0, 2) == 'fi') && bank.substring(4, 6) == '47') || bank.substring(0, 2) == '47')
				{
					if(paid=='Y')
					{
						alert('Loan #'+idz+' is already paid');
					}
					else if(approved=='N' || approved=='?')
					{
						alert('Loan #'+idz+' is denied');
					}
					else if(paid=='N')
					{
						var phase_1 = document.getElementsByTagName('input')[2];
						if (typeof document.getElementsByTagName("input")[4] !== 'undefined') 
						{
							var phase_2 = document.getElementsByTagName("input")[4];
						} 
						else 
						{
							var phase_2 = null;
						}

						if(phase_1 != null && phase_1.name == 'init_basic:accountNumber')
						{
							var iban = bank.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
							document.getElementsByTagName('input')[2].value = iban;
						}
						else if(phase_2 != null)
						{
							var iban = bank.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
							if (
								(
									document.documentElement.textContent || document.documentElement.innerText
								).indexOf(iban) > -1
							) {
								name = dom.getElementsByTagName('name')[0].textContent;
								amount = dom.getElementsByTagName('loan_amount')[0].textContent;
								msg = "LAINA "+name+" "+amount+" E FERRATUM FINLAND OY";
								document.getElementsByTagName('input')[2].value = name;
								document.getElementsByTagName('input')[5].value = amount;
								document.getElementsByTagName('textarea')[1].value = msg;
							} else {
								alert("Account number doesn't match!");
							}
						}
					}
				}
				else
				{
					alert('Ei ole Aktian tili... vaan '+acc2bank(bank)+'!');
				}
			}
		});
	}

	function create_form()
	{
		var new_div, main, newButton, newLoan, normalText;
		main = document.getElementsByTagName('form')[0];
		newButton = document.createElement('div');
		newLoan = document.createElement('input');
		
		normalText = document.createTextNode('Hae tiedot');
		new_div = document.createElement('div');
		newButton.style.position = "relative";
		newButton.style.width = "50px";
		newButton.style.height = "18px";
		newButton.style.top = "-2px";
		newButton.id = "lainanhaku";

		newButton.style.border = "ridge";
		newButton.style.font = "normal normal normal 10px arial";
		newButton.innerHTML = "Search";
		newLoan.style.width="100px";
		newLoan.style.height="20px";
		newLoan.id = "lainanumero";
		main.parentNode.insertBefore(new_div, main);
		main.parentNode.insertBefore(newButton, new_div);
		main.parentNode.insertBefore(newLoan, newButton);
		newButton.addEventListener('click', normal_pay, true);
	}
	create_form();
	refresh_page();
})();