(function (window, $) {
    "use strict";

    function clampPercent(value) {
        if (value < 0) return 0;
        if (value > 100) return 100;
        return value;
    }

    function fixRounding(p1, p2, p3) {
        var sum = p1 + p2 + p3;
        if (sum > 0 && sum !== 100) {
            p3 = clampPercent(100 - p1 - p2);
        }
        return { a: p1, b: p2, c: p3 };
    }

    function updateStateOfCharge(model) {
        if (!model) return;

        var highCount = model.HighSoCCount || 0;
        var lowCount = model.LowSoCCount || 0;
        var chargeNowCount = model.ChargeNowCount || 0;

        var total = model.TotalCount || (highCount + lowCount + chargeNowCount) || 0;

        var highPct = clampPercent(parseFloat(model.HighSoCPercent || 0));
        var lowPct = clampPercent(parseFloat(model.LowSoCPercent || 0));
        var chargePct = clampPercent(parseFloat(model.ChargeNowPercent || 0));

        var fixed = fixRounding(highPct, lowPct, chargePct);
        highPct = fixed.a;
        lowPct = fixed.b;
        chargePct = fixed.c;

        $("#socHighCount").text(highCount);
        $("#socLowCount").text(lowCount);
        $("#socChargeNowCount").text(chargeNowCount);

        $("#socBarHigh").css("width", highPct + "%");
        $("#socBarLow").css("width", lowPct + "%");
        $("#socBarChargeNow").css("width", chargePct + "%");

        var powerModules = model.PowerModulesCount;
        if (typeof powerModules !== "number") {
            powerModules = total;
        }
        $("#socPowerModules").text(powerModules || 0);

        var avg = model.AverageSoC;
        if (typeof avg !== "number") {
            avg = 0;
        }
        $("#socAverageValue").text(isFinite(avg) ? avg : 0);
    }

    function loadStateOfCharge(url) {
        console.log('[SOC] Loading State of Charge data from:', url);
        $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            success: function (data) {
                console.log('[SOC] Data loaded successfully:', data);
                updateStateOfCharge(data);

                console.log('[SOC] About to hide loader...');
                // Try direct approach first
                setTimeout(function() {
                    var $loader = $('#socWidgetLoader');
                    console.log('[SOC] Loader element found:', $loader.length);

                    if ($loader.length > 0) {
                        $loader.addClass('hidden');
                        console.log('[SOC] Added hidden class');

                        // Also set display none after transition
                        setTimeout(function() {
                            $loader.css('display', 'none');
                            console.log('[SOC] Set display none');
                        }, 350);
                    } else {
                        console.error('[SOC] Loader element not found!');
                    }
                }, 100);
            },
            error: function(xhr, status, error) {
                console.error('[SOC] Load failed:', status, error);
                // Hide loader even on error
                setTimeout(function() {
                    $('#socWidgetLoader').addClass('hidden').css('display', 'none');
                }, 100);
            }
        });
    }

    window.DashboardWidgets = window.DashboardWidgets || {};
    window.DashboardWidgets.StateOfCharge = {
        init: function (options) {
            if (!options || !options.url) return;
            loadStateOfCharge(options.url);
        }
    };

})(window, window.jQuery);
