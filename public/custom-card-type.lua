-- -- tracks if this card has been flipped before
-- local hasBeenFlipped = false

-- function onFlip()
-- 	-- disable flipping cards the normal way
-- 	return false
-- end

-- -- on attempt to grab, flip the card and move it up
-- -- don't allow this to happen twice
-- -- don't allow normal grabbing
-- function onGrab()
-- 	if hasBeenFlipped then
-- 		return false
-- 	end

-- 	-- move 4 inches forward (card is 3.5 inches tall)
-- 	setPos({ position[1], position[2], position[3] - 4 })
-- 	flip()
-- 	hasBeenFlipped = true

-- 	return false
-- end