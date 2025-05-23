import { useGPTContext } from "../../components/GPTProvider/GPTProvider";
import type {
	Attributes,
	KeyOfType,
	PrivacySettings,
	UnitTargeting,
} from "../../types";
import { gtag } from "../../utils/gtag";
import type { UseGPT } from "./useGPT.type";

/**
 * A hook that enables dynamic updates to page level and slot configuration
 * @returns
 */
const useGPT = <
	PageAttributes extends Attributes = Attributes,
>(): UseGPT<PageAttributes> => {
	const { units, limitedAds } = useGPTContext();

	/**
	 * This function when called will set the targeting attributes provided for a given slot
	 * @param slotId The unit slot id
	 * @param attributes The attributes to be set
	 * @returns
	 */
	const setTargetingAttributes = <A extends UnitTargeting>(
		slotId: A["slotId"],
		attributes: A["attributes"],
	) => {
		gtag.push(() => {
			const unit = units.find((unit) => unit.slotId === slotId)?.unit;
			for (const targetingKey of Object.keys(attributes)) {
				unit?.setTargeting(targetingKey, attributes[targetingKey]);
			}
		});
	};

	/**
	 * This function when called will set the targeting attributes at a page level
	 * @param attributes The attributes to be set
	 * @returns
	 */
	const setPageTargetingAttributes = (attributes: PageAttributes) => {
		gtag.push(() => {
			for (const targetingKey of Object.keys(attributes)) {
				gtag.setTargeting(targetingKey, attributes[targetingKey]);
			}
		});
	};

	/**
	 * This function when called will either:
	 *
	 * - clear all attributes for a given slot (when no attributes are provided)
	 * - clear specific attributes based on the attribute keys provided
	 * @param slotId The unit slot id
	 * @param attributes The attributes to be cleared
	 * @returns
	 */
	const clearTargetingAttributes = <A extends UnitTargeting>(
		slotId: A["slotId"],
		attributes?: KeyOfType<A["attributes"]>[],
	) => {
		gtag.push(() => {
			const unit = units.find((unit) => unit.slotId === slotId)?.unit;
			if (attributes) {
				for (const targetingKey of attributes) {
					unit?.clearTargeting(targetingKey as string);
				}
			} else unit?.clearTargeting();
		});
	};

	/**
	 * This function when called will either:
	 *
	 * - clear all page level attributes (when no attributes are provided)
	 * - clear specific page level attributes based on attribute keys provided
	 * @param attributes The attributes to be cleared
	 * @returns
	 */
	const clearPageTargetingAttributes = (
		attributes?: KeyOfType<PageAttributes>[],
	) => {
		gtag.push(() => {
			if (attributes) {
				for (const targetingKey of attributes) {
					//@ts-ignore
					gtag.clearTargeting(targetingKey);
				}
			} else gtag.clearTargeting();
		});
	};

	/**
	 * This function when called will update the privacy settings with the values provided
	 * @param settings The privacy settings
	 * @returns
	 */
	const setPrivacySettings = (privacySettings: Partial<PrivacySettings>) => {
		if (!limitedAds && privacySettings.limitedAds !== undefined) {
			throw new Error(
				"limited ads must be enabled on GPTContext to set privacy settings",
			);
		}
		gtag.push(() => {
			gtag.setPrivacySettings(privacySettings);
		});
	};

	return {
		setTargetingAttributes,
		setPageTargetingAttributes,
		clearTargetingAttributes,
		clearPageTargetingAttributes,
		setPrivacySettings,
	};
};

export { useGPT };
