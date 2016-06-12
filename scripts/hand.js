$(function() {
  var url = window.location.pathname.replace(/\/$/, '');
  $('a').each(function(){
    var href= $(this).attr('href');
    var match = new RegExp("^"+ href.replace(/\/$/, ''), 'i');
    if (match.test(url)) {
      $(this).addClass('active');
    }
  });

  	function commaSeparateNumber(val){
		while (/(\d+)(\d{3})/.test(val.toString())){
			val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		}
		return val;
	}


  	var VISIBLE = 0;
  	var SCROLL_TOP = 0;
  	var WINDOW_HEIGHT = $( window ).height() || 0;
  	var LAST_VALUE = 80;
  	var PADDING = 0;
  	var ACTIVE = 0;

  	var MIN_VALUE = 1;
  	var MAX_VALUE = 22500;

  	var PERCENT = 0;


  	var $window = $( window );

	var runOnScroll =  function(evt) {
		SCROLL_TOP = $('body').scrollTop();
		SCROLL_BOTTOM = SCROLL_TOP + WINDOW_HEIGHT;

		$('#scrollTop').text('scrollTop:' + SCROLL_TOP);

		// find visible

		$('article, section').each(function(){
			var $this = $(this);
			var count = $this.data('count');
			var section = $this.data('section');

			var elemStart = $this.offset().top;
			var elemEnd = elemStart + $this.outerHeight();

			if(SCROLL_BOTTOM > elemEnd && SCROLL_TOP < elemEnd){
				ACTIVE = count;
				$('#active').text('active:' + ACTIVE);
			}
		});

		// tween

		var current = $('*[data-count="'+ACTIVE+'"]');
		var next = current.next();

		var currentCount = current.data('count');
		var nextCount = next.data('count');

		var isFooter = current.data('section') === 'footer';
		var isHeader = current.data('section') === 'header';

		// console.log(isFooter, currentCount);

		var start = current.offset().top;
		var end = start + current.outerHeight() - 1;
		PERCENT = (SCROLL_TOP - start)/(end - start);
		var diff = nextCount - currentCount;

		$('#percentage').text('percentage:' + Math.floor(PERCENT*100) + '%');


		var tween = currentCount + (Math.floor(diff * PERCENT));

		if(tween < MIN_VALUE){
			tween = MIN_VALUE
		}else if(tween > MAX_VALUE){
			tween = MAX_VALUE;
		}

		// correct for last

		console.log(PERCENT);

		if(ACTIVE == 0 && PERCENT > 0.5){
			$( ".subtitle span" ).addClass('hidden');
			$( "#counter" ).removeClass('hidden');
		}

		if(ACTIVE == 0 && PERCENT < 0.5){
			$( ".subtitle span" ).removeClass('hidden');
			$( "#counter" ).addClass('hidden');
		}

		if(ACTIVE == MAX_VALUE && PERCENT > 0.4){
			$( "#counter" ).addClass('hidden');
			$( ".party" ).removeClass('hidden');
		}

		if(ACTIVE == MAX_VALUE && PERCENT < 0.4){
			$( "#counter" ).removeClass('hidden');
			$( ".party" ).addClass('hidden');
		}

		if(ACTIVE > 0 && ACTIVE < MAX_VALUE){
			$( "#counter" ).removeClass('hidden');
		}
		
		$( "#count" ).text( "count:" + tween );
		$( "#counter" ).text( commaSeparateNumber(tween) );
	}

	window.addEventListener("scroll", runOnScroll);

	// Listen for resize event and update style of article to fill page
	$( window ).resize(function() {
		console.log("Handler for .resize() called.</div>");
		makeSpace();
	});

	function makeSpace() {
		WINDOW_HEIGHT = $( window ).height();

		$('article, section').each(function () {
			var elemHeight = $(this).height();
			PADDING = (WINDOW_HEIGHT - elemHeight) / 2;
			$(this).css('padding-top',PADDING+'px');
			$(this).css('padding-bottom',PADDING+'px');
			// console.log('makeSpace run');
		});
		$('#counter').css('line-height',WINDOW_HEIGHT+'px');


		var sub = $('.subtitle').outerHeight()/2;

		$('.header-wrapper').css('margin-top',-sub+'px');


	}

	makeSpace();
	runOnScroll();

	console.log('ready');



});
