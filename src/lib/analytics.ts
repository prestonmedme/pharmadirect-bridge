import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Session management for anonymous tracking
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('analytics_session_id') || uuidv4();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  pharmacyId?: string;
  serviceType?: string;
  isMedmePharmacy?: boolean;
}

export interface PharmacyImpression {
  pharmacyId: string;
  impressionType: 'view' | 'click_call' | 'click_directions' | 'click_website' | 'click_book';
  serviceContext?: string;
  isMedmePharmacy?: boolean;
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  /**
   * Track general user analytics events (searches, bookings, etc.)
   */
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('user_analytics_events')
        .insert({
          user_id: user?.id || null,
          session_id: getSessionId(),
          event_type: event.eventType,
          event_data: event.eventData || {},
          pharmacy_id: event.pharmacyId || null,
          service_type: event.serviceType || null,
          is_medme_pharmacy: event.isMedmePharmacy || false,
        });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track pharmacy-specific impressions and interactions
   */
  static async trackPharmacyImpression(impression: PharmacyImpression): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('pharmacy_impressions')
        .insert({
          pharmacy_id: impression.pharmacyId,
          user_id: user?.id || null,
          session_id: getSessionId(),
          impression_type: impression.impressionType,
          service_context: impression.serviceContext || null,
          is_medme_pharmacy: impression.isMedmePharmacy || false,
          metadata: impression.metadata || {},
        });
    } catch (error) {
      console.warn('Pharmacy impression tracking failed:', error);
    }
  }

  /**
   * Track search events with results count
   */
  static async trackSearch(serviceType: string, location: string, resultsCount: number): Promise<void> {
    await this.trackEvent({
      eventType: 'search',
      eventData: {
        location,
        results_count: resultsCount
      },
      serviceType
    });
  }

  /**
   * Track when search results are shown to user
   */
  static async trackResultsShown(serviceType: string, resultsCount: number, medmeCount: number): Promise<void> {
    await this.trackEvent({
      eventType: 'results_shown',
      eventData: {
        total_results: resultsCount,
        medme_results: medmeCount,
        medme_percentage: resultsCount > 0 ? (medmeCount / resultsCount * 100) : 0
      },
      serviceType
    });
  }

  /**
   * Track pharmacy profile views
   */
  static async trackPharmacyView(pharmacyId: string, isMedmePharmacy: boolean, serviceContext?: string): Promise<void> {
    await Promise.all([
      this.trackEvent({
        eventType: 'profile_view',
        pharmacyId,
        isMedmePharmacy,
        serviceType: serviceContext
      }),
      this.trackPharmacyImpression({
        pharmacyId,
        impressionType: 'view',
        serviceContext,
        isMedmePharmacy
      })
    ]);
  }

  /**
   * Track booking funnel steps
   */
  static async trackBookingStep(step: 'book_start' | 'book_confirmed', pharmacyId: string, serviceType: string, isMedmePharmacy: boolean): Promise<void> {
    await Promise.all([
      this.trackEvent({
        eventType: step,
        pharmacyId,
        serviceType,
        isMedmePharmacy
      }),
      this.trackPharmacyImpression({
        pharmacyId,
        impressionType: 'click_book',
        serviceContext: serviceType,
        isMedmePharmacy,
        metadata: { step }
      })
    ]);
  }

  /**
   * Track pharmacy interaction clicks (call, directions, website)
   */
  static async trackPharmacyClick(type: 'call' | 'directions' | 'website', pharmacyId: string, isMedmePharmacy: boolean, serviceContext?: string): Promise<void> {
    await this.trackPharmacyImpression({
      pharmacyId,
      impressionType: `click_${type}` as any,
      serviceContext,
      isMedmePharmacy
    });
  }
}